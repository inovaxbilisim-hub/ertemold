import { dbAll } from '@/core/database/db';
import { ensureAnalyticsTables } from '@/modules/analytics/lib/analytics';
import { verifySession } from '@/core/auth/auth';
import { AnalyticsData, PhoneClickBranchSummary } from '@/core/types';
import { ok, unauthorized, serverError } from '@/core/api/response';

export async function GET(_request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    await ensureAnalyticsTables();

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [pageViewAgg, phoneClickAgg, phoneClicksByBranch, dailyBreakdownRows] = await Promise.all([
      // 4 COUNT queries → 1 grouped query
      dbAll<{
        active_users: number; daily_visits: number;
        weekly_visits: number; monthly_visits: number;
      }>(`
        SELECT
          COUNT(DISTINCT CASE WHEN created_at > $1 THEN session_id END) as active_users,
          COUNT(DISTINCT CASE WHEN created_at > $2 THEN session_id END) as daily_visits,
          COUNT(DISTINCT CASE WHEN created_at > $3 THEN session_id END) as weekly_visits,
          COUNT(DISTINCT CASE WHEN created_at > $4 THEN session_id END) as monthly_visits
        FROM page_views
      `, [fiveMinAgo, twentyFourHoursAgo, weekAgo, monthAgo]),

      // 8 phone click COUNT queries → 1 grouped query
      dbAll<{
        phone_total: number; whatsapp_total: number;
        phone_today: number; phone_week: number; phone_month: number;
        whatsapp_today: number; whatsapp_week: number; whatsapp_month: number;
      }>(`
        SELECT
          COUNT(CASE WHEN (source IS NULL OR source <> 'whatsapp') THEN 1 END) as phone_total,
          COUNT(CASE WHEN source = 'whatsapp' THEN 1 END) as whatsapp_total,
          COUNT(CASE WHEN (source IS NULL OR source <> 'whatsapp') AND created_at > $1 THEN 1 END) as phone_today,
          COUNT(CASE WHEN (source IS NULL OR source <> 'whatsapp') AND created_at > $2 THEN 1 END) as phone_week,
          COUNT(CASE WHEN (source IS NULL OR source <> 'whatsapp') AND created_at > $3 THEN 1 END) as phone_month,
          COUNT(CASE WHEN source = 'whatsapp' AND created_at > $1 THEN 1 END) as whatsapp_today,
          COUNT(CASE WHEN source = 'whatsapp' AND created_at > $2 THEN 1 END) as whatsapp_week,
          COUNT(CASE WHEN source = 'whatsapp' AND created_at > $3 THEN 1 END) as whatsapp_month
        FROM phone_click_events
      `, [twentyFourHoursAgo, weekAgo, monthAgo]),

      dbAll<PhoneClickBranchSummary>(
        `
          WITH grouped_phone_clicks AS (
            SELECT
              CASE
                WHEN COALESCE(NULLIF(branch_id, ''), '') <> '' THEN branch_id
                ELSE COALESCE(
                  (
                    SELECT id::text FROM business_branches
                    WHERE REPLACE(phone, ' ', '') = REPLACE(phone_click_events.phone, ' ', '')
                    AND (COALESCE(NULLIF(phone_click_events.city_slug, ''), '') = '' OR city_slug = phone_click_events.city_slug)
                    LIMIT 1
                  ),
                  'legacy:' || COALESCE(NULLIF(phone, ''), 'unknown') || ':' || COALESCE(NULLIF(city_slug, ''), 'default')
                )
              END as branch_group_key,
              MAX(COALESCE(NULLIF(branch_id, ''), '')) as branchid,
              MAX(COALESCE(NULLIF(branch_title, ''), '')) as branchtitle,
              MAX(COALESCE(NULLIF(city_name, ''), '')) as cityname,
              MAX(COALESCE(NULLIF(city_slug, ''), '')) as cityslug,
              MAX(COALESCE(NULLIF(phone, ''), '')) as phone,
              COUNT(*) as totalclicks,
              SUM(CASE WHEN created_at > $1 THEN 1 ELSE 0 END) as dailyclicks,
              SUM(CASE WHEN created_at > $2 THEN 1 ELSE 0 END) as weeklyclicks,
              SUM(CASE WHEN created_at > $3 THEN 1 ELSE 0 END) as monthlyclicks,
              SUM(CASE WHEN source = 'whatsapp' THEN 1 ELSE 0 END) as whatsappclicks,
              MAX(created_at) as lastclickedat
            FROM phone_click_events
            GROUP BY branch_group_key
          )
          SELECT
            COALESCE(NULLIF(grouped_phone_clicks.branchid, ''), grouped_phone_clicks.branch_group_key) as "branchId",
            COALESCE(NULLIF(business_branches.title, ''), grouped_phone_clicks.branchtitle) as "branchTitle",
            COALESCE(NULLIF(business_branches.city_name, ''), grouped_phone_clicks.cityname) as "cityName",
            COALESCE(NULLIF(business_branches.city_slug, ''), grouped_phone_clicks.cityslug) as "citySlug",
            COALESCE(NULLIF(business_branches.phone, ''), grouped_phone_clicks.phone) as "phone",
            grouped_phone_clicks.totalclicks as "totalClicks",
            grouped_phone_clicks.dailyclicks as "dailyClicks",
            grouped_phone_clicks.weeklyclicks as "weeklyClicks",
            grouped_phone_clicks.monthlyclicks as "monthlyClicks",
            grouped_phone_clicks.whatsappclicks as "whatsappClicks",
            grouped_phone_clicks.lastclickedat as "lastClickedAt"
          FROM grouped_phone_clicks
          LEFT JOIN business_branches ON business_branches.id::text = COALESCE(NULLIF(grouped_phone_clicks.branchid, ''), grouped_phone_clicks.branch_group_key)
          ORDER BY grouped_phone_clicks.monthlyclicks DESC, grouped_phone_clicks.totalclicks DESC, grouped_phone_clicks.lastclickedat DESC
        `,
        [twentyFourHoursAgo, weekAgo, monthAgo]
      ),

      // Fetch daily breakdown for the last 7 days grouped by day of week
      dbAll<{ day_index: number; visits: number }>(`
        SELECT
          EXTRACT(ISODOW FROM created_at) - 1 as day_index,
          COUNT(DISTINCT session_id) as visits
        FROM page_views
        WHERE created_at > $1
        GROUP BY day_index
      `, [weekAgo]),
    ]);

    const pv = pageViewAgg[0] || {};
    const pc = phoneClickAgg[0] || {};

    const dailyBreakdown = [0, 0, 0, 0, 0, 0, 0];
    dailyBreakdownRows.forEach(row => {
      const idx = Number(row.day_index);
      if (idx >= 0 && idx <= 6) {
        dailyBreakdown[idx] = Number(row.visits);
      }
    });

    const analytics: AnalyticsData = {
      activeUsers: Number(pv.active_users || 0),
      dailyVisits: Number(pv.daily_visits || 0),
      weeklyVisits: Number(pv.weekly_visits || 0),
      monthlyVisits: Number(pv.monthly_visits || 0),
      phoneClicksTotal: Number(pc.phone_total || 0),
      phoneClicksToday: Number(pc.phone_today || 0),
      phoneClicksThisWeek: Number(pc.phone_week || 0),
      phoneClicksThisMonth: Number(pc.phone_month || 0),
      whatsappClicksTotal: Number(pc.whatsapp_total || 0),
      whatsappClicksToday: Number(pc.whatsapp_today || 0),
      whatsappClicksThisWeek: Number(pc.whatsapp_week || 0),
      whatsappClicksThisMonth: Number(pc.whatsapp_month || 0),
      phoneClicksByBranch: phoneClicksByBranch.map(b => ({
        ...b,
        totalClicks: Number(b.totalClicks || 0),
        dailyClicks: Number(b.dailyClicks || 0),
        weeklyClicks: Number(b.weeklyClicks || 0),
        monthlyClicks: Number(b.monthlyClicks || 0),
        whatsappClicks: Number(b.whatsappClicks || 0),
      })),
      dailyBreakdown,
    };

    return ok(analytics);
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
