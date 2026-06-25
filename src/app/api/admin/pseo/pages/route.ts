import { dbAll } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, serverError } from '@/core/api/response';

export async function GET(_request: Request) {
  try {
    const isAuth = await verifySession();
    if (!isAuth) return unauthorized();

    // request searchParams not used

    // 1. Get Potential Stats
    const { getPotentialPseoCount } = await import('@/modules/seo/lib/pseo-utils');
    const potential_total = await getPotentialPseoCount();

    const [services] = await Promise.all([
      dbAll("SELECT id FROM services WHERE active = true"),
    ]);

    // 2. Legacy pseo_pages tablosu kaldırıldı (Migration 007)
    // Artık orphan takibi gerekmiyor — on-demand mode aktif

    return ok({
      pages: [], // We don't list pages anymore as they are on-demand
      services_count: services.length,
      sectors_count: 1,
      stats: {
        potential: potential_total,
        discovered: potential_total,
        completed: potential_total, // All potential are "completed" in on-demand mode
        pending: 0,
        failed: 0,
        orphans: 0,
        remaining_discovery: 0
      }
    });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}
