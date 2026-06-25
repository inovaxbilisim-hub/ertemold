import { revalidatePath, revalidateTag } from 'next/cache';
import { dbGet, dbUpsert, dbBatch, parseDbJson, ensureTableColumn } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { defaultSectionVisibility } from '@/modules/settings/lib/ui-content';
import type { NavItem, SiteSettings, SiteUiContent, SiteSectionVisibility } from '@/core/types';
import { ok, unauthorized, notFound, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';
import { auditLog } from '@/core/security/audit';

function normalizeContactEmails(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    if (value === '') return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      // fall through to comma-separated parsing
    }
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

async function revalidateSettings() {
  revalidateTag(CACHE_TAGS.SETTINGS, 'default');
  revalidateTag(CACHE_TAGS.SERVICES, 'default');
  revalidatePath('/', 'layout');
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    await ensureTableColumn('site_settings', 'active_plugins', 'TEXT');
    await ensureTableColumn('site_settings', 'plugin_configs', 'TEXT');
    await ensureTableColumn('site_settings', 'sitemap_chunk_size', 'INTEGER DEFAULT 0');
    await ensureTableColumn('site_settings', 'pseo_simulated_stats', 'BOOLEAN DEFAULT FALSE');
    await ensureTableColumn('site_settings', 'content_min_projects', 'INTEGER DEFAULT 2');
    await ensureTableColumn('site_settings', 'content_min_references', 'INTEGER DEFAULT 1');
    await ensureTableColumn('site_settings', 'content_require_unique_data', 'BOOLEAN DEFAULT FALSE');
    await ensureTableColumn('site_settings', 'content_redirect_to_main', 'BOOLEAN DEFAULT TRUE');
    await ensureTableColumn('site_settings', 'gemini_api_keys', 'TEXT');
    await ensureTableColumn('site_settings', 'contact_email', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_service_fields', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_category_fields', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_description', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_json', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_faq', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_faq_json', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_sector_faq_min_count', 'INTEGER DEFAULT 8');
    await ensureTableColumn('site_settings', 'openrouter_api_keys', 'TEXT');
    await ensureTableColumn('site_settings', 'openrouter_ai_model', 'TEXT');
    await ensureTableColumn('site_settings', 'gemini_ai_model', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_bot_enabled', 'BOOLEAN DEFAULT FALSE');
    await ensureTableColumn('site_settings', 'ai_bot_interval', 'INTEGER DEFAULT 5');
    await ensureTableColumn('site_settings', 'footer_link_groups', 'TEXT DEFAULT \'[]\'');
    const data = await dbGet<Record<string, unknown>>(
      'SELECT id, title, site_url, company_name, phone, email, contact_email, address, maps_link, whatsapp, code_injection, brand, announcement, navigation, footer_links, footer_bottom_links, footer_link_groups, social_media, working_hours, company_description, smtp, geo_service, sitemap_chunk_size, show_whatsapp, pseo_mode, pseo_country, pseo_location_suffix, pseo_action_verb, pseo_service_suffix, pseo_auto_optimize, pseo_ai_enabled, pseo_prompt_template, ai_provider, openrouter_api_key, openrouter_api_keys, gemini_api_key, gemini_api_keys, ai_model, openrouter_ai_model, gemini_ai_model, ai_prompt_service, ai_prompt_service_fields, ai_prompt_category, ai_prompt_category_fields, ai_prompt_legal, ai_prompt_seo_master, ai_prompt_faq, ai_prompt_sector_description, ai_prompt_sector_json, ai_prompt_sector_faq, ai_prompt_sector_faq_json, ai_sector_faq_min_count, ai_faq_min_count, global_og_image, ui_content, section_visibility, faq_visibility, pseo_internal_linking, pseo_social_proof, pseo_social_proof_min, pseo_social_proof_max, pseo_social_proof_text, pseo_simulated_stats, content_min_projects, content_min_references, content_require_unique_data, content_redirect_to_main, geo_enabled, geo_faq_enabled, geo_org_same_as, geo_know_about, geo_publishing_principles, geo_founder_name, geo_founder_same_as, geo_prompt_faq, geo_prompt_summary, cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_upload_preset, active_plugins, plugin_configs, ai_bot_enabled, ai_bot_interval FROM site_settings LIMIT 1'
    );

    if (!data) return notFound('Settings not found');

    const parsed: any = {
      id: data.id,
      title: data.title || '',
      siteUrl: data.site_url || '',
      companyName: data.company_name ?? data.companyName,
      phone: data.phone,
      email: data.email,
      contactEmails: normalizeContactEmails(data.contact_email ?? data.contactEmails),
      contactEmail: normalizeContactEmails(data.contact_email ?? data.contactEmails)[0] || String(data.contact_email ?? data.contactEmail ?? ''),
      address: data.address,
      mapsLink: data.maps_link ?? data.mapsLink,
      whatsapp: data.whatsapp,
      codeInjection: parseDbJson(data.code_injection, {}),
      brand: parseDbJson(data.brand, { logoPath: '', faviconPath: '' }),
      announcement: parseDbJson(data.announcement, { active: false, text: '', link: '' }),
      navigation: parseDbJson<NavItem[]>(data.navigation, []),
      smtp: parseDbJson(data.smtp, { host: '', port: 587, user: '', pass: '', secure: false }),
      footerLinks: parseDbJson(data.footer_links, []),
      footerBottomLinks: parseDbJson(data.footer_bottom_links, []),
      footerLinkGroups: parseDbJson(data.footer_link_groups, []),
      socialMedia: parseDbJson(data.social_media, []),
      workingHours: data.working_hours ?? '',
      companyDescription: data.company_description ?? '',
      geoService: data.geo_service ?? '',
      sitemapChunkSize: Number(data.sitemap_chunk_size ?? data.sitemapChunkSize ?? 0),
      showWhatsApp: Boolean(data.show_whatsapp ?? 0),
      pseo_mode: data.pseo_mode ?? '',
      pseo_country: data.pseo_country ?? '',
      pseo_location_suffix: data.pseo_location_suffix ?? '',
      pseo_action_verb: data.pseo_action_verb || '',
      pseo_service_suffix: data.pseo_service_suffix || '',
      pseo_auto_optimize: data.pseo_auto_optimize === 'true' || data.pseo_auto_optimize === true,
      pseo_ai_enabled: Boolean(data.pseo_ai_enabled ?? 0),
      pseo_prompt_template: data.pseo_prompt_template || '',
      ai_provider: data.ai_provider ?? '',
      openrouter_api_key: data.openrouter_api_key || '',
      openrouter_api_keys: parseDbJson<string[]>(data.openrouter_api_keys, []),
      gemini_api_key: data.gemini_api_key || '',
      gemini_api_keys: parseDbJson<string[]>(data.gemini_api_keys, []),
      ai_model: data.ai_model || '',
      openrouter_ai_model: data.openrouter_ai_model || '',
      gemini_ai_model: data.gemini_ai_model || '',
      ai_prompt_service: data.ai_prompt_service || '',
      ai_prompt_category: data.ai_prompt_category || '',
      ai_prompt_legal: data.ai_prompt_legal || '',
      ai_prompt_seo_master: data.ai_prompt_seo_master || '',
      ai_prompt_faq: data.ai_prompt_faq || '',
      ai_prompt_sector_description: data.ai_prompt_sector_description || '',
      ai_prompt_sector_json: data.ai_prompt_sector_json || '',
      ai_prompt_sector_faq: data.ai_prompt_sector_faq || '',
      ai_prompt_sector_faq_json: data.ai_prompt_sector_faq_json || '',
      ai_sector_faq_min_count: Number(data.ai_sector_faq_min_count ?? 8),
      ai_faq_min_count: Number(data.ai_faq_min_count ?? 8),
      globalOgImage: data.global_og_image || '',
      uiContent: parseDbJson<Partial<SiteUiContent>>(data.ui_content, {}),
      sectionVisibility: parseDbJson<SiteSectionVisibility>(data.section_visibility, defaultSectionVisibility),
      faq_visibility: parseDbJson<string[]>(data.faq_visibility, []),
      pseo_internal_linking: Boolean(data.pseo_internal_linking ?? 0),
      pseo_social_proof: Boolean(data.pseo_social_proof ?? 0),
      pseo_social_proof_min: Number(data.pseo_social_proof_min ?? 0),
      pseo_social_proof_max: Number(data.pseo_social_proof_max ?? 0),
      pseo_social_proof_text: data.pseo_social_proof_text || '',
      pseo_simulated_stats: Boolean(data.pseo_simulated_stats ?? 0),
      content_min_projects: Number(data.content_min_projects ?? 2),
      content_min_references: Number(data.content_min_references ?? 1),
      content_require_unique_data: Boolean(data.content_require_unique_data ?? 0),
      content_redirect_to_main: Boolean(data.content_redirect_to_main ?? 1),
      geo_enabled: Boolean(data.geo_enabled ?? 0),
      geo_faq_enabled: Boolean(data.geo_faq_enabled ?? 0),
      geo_org_same_as: parseDbJson<string[]>(data.geo_org_same_as, []),
      geo_know_about: data.geo_know_about || '',
      geo_publishing_principles: data.geo_publishing_principles || '',
      geo_founder_name: data.geo_founder_name || '',
      geo_founder_same_as: data.geo_founder_same_as || '',
      geo_prompt_faq: data.geo_prompt_faq || '',
      geo_prompt_summary: data.geo_prompt_summary || '',
      cloudinary_cloud_name: data.cloudinary_cloud_name || '',
      cloudinary_api_key: data.cloudinary_api_key || '',
      cloudinary_api_secret: data.cloudinary_api_secret || '',
      cloudinary_upload_preset: data.cloudinary_upload_preset || '',
      active_plugins: parseDbJson<string[]>(data.active_plugins, []),
      plugin_configs: parseDbJson<Record<string, any>>(data.plugin_configs, {}),
      ai_bot_enabled: data.ai_bot_enabled === true || data.ai_bot_enabled === 'true' || data.ai_bot_enabled === 1,
      ai_bot_interval: Number(data.ai_bot_interval ?? 5),
    };

    return ok(parsed);
  } catch (error: unknown) {
    console.error('[admin/settings] GET error:', error);
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const start = Date.now();

  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    await ensureTableColumn('site_settings', 'active_plugins', 'TEXT');
    await ensureTableColumn('site_settings', 'plugin_configs', 'TEXT');
    await ensureTableColumn('site_settings', 'pseo_simulated_stats', 'BOOLEAN DEFAULT FALSE');
    await ensureTableColumn('site_settings', 'content_min_projects', 'INTEGER DEFAULT 2');
    await ensureTableColumn('site_settings', 'content_min_references', 'INTEGER DEFAULT 1');
    await ensureTableColumn('site_settings', 'content_require_unique_data', 'BOOLEAN DEFAULT FALSE');
    await ensureTableColumn('site_settings', 'content_redirect_to_main', 'BOOLEAN DEFAULT TRUE');
    await ensureTableColumn('site_settings', 'gemini_api_keys', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_description', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_json', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_faq', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_faq_json', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_sector_faq_min_count', 'INTEGER DEFAULT 8');
    await ensureTableColumn('site_settings', 'openrouter_api_keys', 'TEXT');
    await ensureTableColumn('site_settings', 'openrouter_ai_model', 'TEXT');
    await ensureTableColumn('site_settings', 'gemini_ai_model', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_bot_enabled', 'BOOLEAN DEFAULT FALSE');
    await ensureTableColumn('site_settings', 'ai_bot_interval', 'INTEGER DEFAULT 5');
    await ensureTableColumn('site_settings', 'footer_link_groups', 'TEXT DEFAULT \'[]\'');

    const data = (await request.json()) as Partial<SiteSettings> & {
      appearance?: Record<string, unknown>;
      faq_visibility?: string[];
      geo_org_same_as?: string[];
    };
    const legacyContactValue = (data as any).contact_email;

    const existingRow = (await dbGet<Record<string, any>>('SELECT * FROM site_settings WHERE id = 1')) || {};

    const normalizedAiProvider = String(data.ai_provider ?? existingRow.ai_provider).trim();
    if (!normalizedAiProvider) {
      if (data.openrouter_api_key) {
        data.ai_provider = 'openrouter';
      } else if (data.gemini_api_key) {
        data.ai_provider = 'gemini';
      }
    }

    const payload: Record<string, unknown> = {
      id: 1,
      title: data.title ?? existingRow.title,
      site_url: data.siteUrl ?? existingRow.site_url,
      company_name: data.companyName,
      phone: data.phone,
      email: data.email,
      contact_email: Array.isArray(data.contactEmails)
        ? JSON.stringify(data.contactEmails.filter(Boolean).map((item) => String(item).trim()))
        : String(data.contactEmail || legacyContactValue || ''),
      address: data.address,
      maps_link: data.mapsLink,
      whatsapp: data.whatsapp,
      code_injection: data.codeInjection !== undefined ? JSON.stringify(data.codeInjection) : existingRow.code_injection,
      brand: JSON.stringify(data.brand || { logoPath: '', faviconPath: '' }),
      announcement: JSON.stringify(data.announcement || { active: false, text: '', link: '' }),
      navigation: data.navigation !== undefined ? JSON.stringify(data.navigation) : existingRow.navigation,
      smtp: JSON.stringify(data.smtp || { host: '', port: 587, user: '', pass: '', secure: false }),
      footer_links: data.footerLinks !== undefined ? JSON.stringify(data.footerLinks) : existingRow.footer_links,
      footer_bottom_links: data.footerBottomLinks !== undefined ? JSON.stringify(data.footerBottomLinks) : existingRow.footer_bottom_links,
      footer_link_groups: data.footerLinkGroups !== undefined ? JSON.stringify(data.footerLinkGroups) : (existingRow.footer_link_groups ?? '[]'),
      social_media: data.socialMedia !== undefined ? JSON.stringify(data.socialMedia) : existingRow.social_media,
      working_hours: data.workingHours ?? existingRow.working_hours,
      company_description: data.companyDescription ?? existingRow.company_description,
      geo_service: data.geoService ?? '',
      sitemap_chunk_size: Math.max(0, Math.floor(Number(data.sitemapChunkSize ?? (data as any).sitemap_chunk_size ?? 0))),
      show_whatsapp: data.showWhatsApp ? true : false,
      pseo_mode: data.pseo_mode ?? '',
      pseo_country: data.pseo_country ?? '',
      pseo_location_suffix: data.pseo_location_suffix ?? '',
      pseo_action_verb: data.pseo_action_verb ?? existingRow.pseo_action_verb,
      pseo_service_suffix: data.pseo_service_suffix ?? existingRow.pseo_service_suffix,
      pseo_auto_optimize: data.pseo_auto_optimize ? 'true' : 'false',
      pseo_ai_enabled: data.pseo_ai_enabled ? true : false,
      pseo_prompt_template: data.pseo_prompt_template ?? existingRow.pseo_prompt_template,
      ai_provider: data.ai_provider ?? '',
      openrouter_api_key: data.openrouter_api_key ?? existingRow.openrouter_api_key,
      openrouter_api_keys: data.openrouter_api_keys !== undefined ? JSON.stringify(data.openrouter_api_keys) : existingRow.openrouter_api_keys,
      gemini_api_key: data.gemini_api_key ?? existingRow.gemini_api_key,
      gemini_api_keys: data.gemini_api_keys !== undefined ? JSON.stringify(data.gemini_api_keys) : existingRow.gemini_api_keys,
      ai_model: data.ai_model ?? existingRow.ai_model,
      openrouter_ai_model: data.openrouter_ai_model ?? existingRow.openrouter_ai_model,
      gemini_ai_model: data.gemini_ai_model ?? existingRow.gemini_ai_model,
      ai_prompt_service: data.ai_prompt_service ?? existingRow.ai_prompt_service,
      ai_prompt_service_fields: data.ai_prompt_service_fields !== undefined ? JSON.stringify(data.ai_prompt_service_fields) : existingRow.ai_prompt_service_fields,
      ai_prompt_category: data.ai_prompt_category ?? existingRow.ai_prompt_category,
      ai_prompt_category_fields: data.ai_prompt_category_fields !== undefined ? JSON.stringify(data.ai_prompt_category_fields) : existingRow.ai_prompt_category_fields,
      ai_prompt_legal: data.ai_prompt_legal ?? existingRow.ai_prompt_legal,
      ai_prompt_seo_master: data.ai_prompt_seo_master ?? existingRow.ai_prompt_seo_master,
      ai_prompt_faq: data.ai_prompt_faq ?? existingRow.ai_prompt_faq,
      ai_prompt_sector_description: data.ai_prompt_sector_description ?? existingRow.ai_prompt_sector_description,
      ai_prompt_sector_json: data.ai_prompt_sector_json ?? existingRow.ai_prompt_sector_json,
      ai_prompt_sector_faq: data.ai_prompt_sector_faq ?? existingRow.ai_prompt_sector_faq,
      ai_prompt_sector_faq_json: data.ai_prompt_sector_faq_json ?? existingRow.ai_prompt_sector_faq_json,
      ai_sector_faq_min_count: Math.max(1, Math.min(20, Number(data.ai_sector_faq_min_count ?? existingRow.ai_sector_faq_min_count ?? 8))),
      ai_faq_min_count: Math.max(1, Math.min(20, Number(data.ai_faq_min_count ?? existingRow.ai_faq_min_count ?? 8))),
      global_og_image: data.globalOgImage ?? existingRow.globalOgImage,
      ui_content: data.uiContent !== undefined ? JSON.stringify(data.uiContent) : existingRow.ui_content,
      section_visibility: JSON.stringify(data.sectionVisibility || defaultSectionVisibility),
      faq_visibility: data.faq_visibility !== undefined ? JSON.stringify(data.faq_visibility) : existingRow.faq_visibility,
      pseo_internal_linking: data.pseo_internal_linking ? true : false,
      pseo_social_proof: data.pseo_social_proof ? true : false,
      pseo_social_proof_min: Number(data.pseo_social_proof_min ?? 0),
      pseo_social_proof_max: Number(data.pseo_social_proof_max ?? 0),
      pseo_social_proof_text: data.pseo_social_proof_text ?? existingRow.pseo_social_proof_text,
      pseo_simulated_stats: data.pseo_simulated_stats ? true : false,
      content_min_projects: Math.max(0, Number(data.content_min_projects ?? 2)),
      content_min_references: Math.max(0, Number(data.content_min_references ?? 1)),
      content_require_unique_data: data.content_require_unique_data ? true : false,
      content_redirect_to_main: data.content_redirect_to_main !== false,
      // GEO & Entity
      geo_enabled: data.geo_enabled ? true : false,
      geo_faq_enabled: data.geo_faq_enabled ? true : false,
      geo_org_same_as: data.geo_org_same_as !== undefined ? JSON.stringify(data.geo_org_same_as) : existingRow.geo_org_same_as,
      geo_know_about: data.geo_know_about ?? existingRow.geo_know_about,
      geo_publishing_principles: data.geo_publishing_principles ?? existingRow.geo_publishing_principles,
      geo_founder_name: data.geo_founder_name ?? existingRow.geo_founder_name,
      geo_founder_same_as: data.geo_founder_same_as ?? existingRow.geo_founder_same_as,
      geo_prompt_faq: data.geo_prompt_faq ?? existingRow.geo_prompt_faq,
      geo_prompt_summary: data.geo_prompt_summary ?? existingRow.geo_prompt_summary,
      cloudinary_cloud_name: data.cloudinary_cloud_name ?? existingRow.cloudinary_cloud_name,
      cloudinary_api_key: data.cloudinary_api_key ?? existingRow.cloudinary_api_key,
      cloudinary_api_secret: data.cloudinary_api_secret ?? existingRow.cloudinary_api_secret,
      cloudinary_upload_preset: data.cloudinary_upload_preset ?? existingRow.cloudinary_upload_preset,
      active_plugins: data.active_plugins !== undefined ? JSON.stringify(data.active_plugins) : existingRow.active_plugins,
      plugin_configs: data.plugin_configs !== undefined ? JSON.stringify(data.plugin_configs) : existingRow.plugin_configs,
      ai_bot_enabled: data.ai_bot_enabled !== undefined ? (data.ai_bot_enabled ? true : false) : (existingRow.ai_bot_enabled ?? false),
      ai_bot_interval: data.ai_bot_interval !== undefined ? Math.max(1, Number(data.ai_bot_interval)) : (Number(existingRow.ai_bot_interval) || 5),
    };

    if (data.appearance && typeof data.appearance === 'object' && Object.keys(data.appearance).length > 0) {
      payload.appearance = JSON.stringify(data.appearance);
    }

    await dbUpsert('site_settings', payload, 'id');

    // Navigasyon sırasına göre servis sort_order güncelle
    const navItems = data.navigation || [];
    if (Array.isArray(navItems) && navItems.length > 0) {
      const statements: { sql: string; args: unknown[] }[] = [];
      let currentOrder = 0;

      const extractServicesOrder = (items: NavItem[]) => {
        for (const item of items) {
          if (item.href && item.href.startsWith('/hizmetler/') && item.href.length > 11) {
            const serviceId = item.href.replace('/hizmetler/', '').split('/')[0];
            statements.push({ sql: 'UPDATE services SET sort_order = ? WHERE id = ?', args: [currentOrder++, serviceId] });
          }
          if (item.children) extractServicesOrder(item.children);
        }
      };

      extractServicesOrder(navItems);
      if (statements.length > 0) await dbBatch(statements);
    }

    await revalidateSettings();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await auditLog({ action: 'settings_update', entity: 'settings', actor: ip, ip_address: ip, details: { duration: Date.now() - start } });

    return ok(null);
  } catch (error: unknown) {
    console.error('[admin/settings] upsert failed:', error);
    return serverError(error);
  }
}

/**
 * PATCH /api/admin/settings
 * Accepts a partial settings object and merges it into the existing DB row.
 * Only the fields present in the request body are updated — everything else
 * stays untouched. This is safer than POST for narrow-scope saves (e.g. modals
 * that only own 4-5 fields), because POST rewrites the entire row and can
 * accidentally reset unrelated fields when the payload misses camelCase→snake_case mapping.
 */
export async function PATCH(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    // Ensure all patchable columns exist before writing
    await ensureTableColumn('site_settings', 'ai_prompt_sector_description', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_json', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_faq', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_sector_faq_json', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_sector_faq_min_count', 'INTEGER DEFAULT 8');
    await ensureTableColumn('site_settings', 'ai_faq_min_count', 'INTEGER DEFAULT 8');
    await ensureTableColumn('site_settings', 'active_plugins', 'TEXT');
    await ensureTableColumn('site_settings', 'plugin_configs', 'TEXT');

    const data = (await request.json()) as Record<string, unknown>;

    // Build update object with only known / safe keys
    const SAFE_PATCH_KEYS: Record<string, string> = {
      ai_prompt_sector_description: 'ai_prompt_sector_description',
      ai_prompt_sector_json: 'ai_prompt_sector_json',
      ai_prompt_sector_faq: 'ai_prompt_sector_faq',
      ai_prompt_sector_faq_json: 'ai_prompt_sector_faq_json',
      ai_sector_faq_min_count: 'ai_sector_faq_min_count',
      ai_faq_min_count: 'ai_faq_min_count',
      ai_prompt_service: 'ai_prompt_service',
      ai_prompt_category: 'ai_prompt_category',
      ai_prompt_legal: 'ai_prompt_legal',
      ai_prompt_faq: 'ai_prompt_faq',
      ai_prompt_seo_master: 'ai_prompt_seo_master',
      ai_provider: 'ai_provider',
      ai_model: 'ai_model',
      openrouter_ai_model: 'openrouter_ai_model',
      gemini_ai_model: 'gemini_ai_model',
      openrouter_api_key: 'openrouter_api_key',
      openrouter_api_keys: 'openrouter_api_keys',
      gemini_api_key: 'gemini_api_key',
      gemini_api_keys: 'gemini_api_keys',
      active_plugins: 'active_plugins',
      plugin_configs: 'plugin_configs',
    };

    const patch: Record<string, unknown> = { id: 1 };

    for (const [inKey, dbKey] of Object.entries(SAFE_PATCH_KEYS)) {
      if (!(inKey in data)) continue;
      const val = data[inKey];

      // Numeric fields
      if (inKey === 'ai_sector_faq_min_count' || inKey === 'ai_faq_min_count') {
        patch[dbKey] = Math.max(1, Math.min(50, Number(val) || 3));
        continue;
      }

      // JSON fields
      if (inKey === 'active_plugins' || inKey === 'plugin_configs') {
        patch[dbKey] = typeof val === 'string' ? val : JSON.stringify(val);
        continue;
      }

      patch[dbKey] = val;
    }

    if (Object.keys(patch).length <= 1) {
      // Only id — nothing to update
      console.log('[admin/settings] PATCH empty patch object:', patch);
      return ok(null);
    }

    console.log('[admin/settings] PATCH executing with payload:', patch);
    await dbUpsert('site_settings', patch, 'id');
    await revalidateSettings();

    return ok(null);
  } catch (error: unknown) {
    console.error('[admin/settings] PATCH failed:', error);
    return serverError(error);
  }
}
