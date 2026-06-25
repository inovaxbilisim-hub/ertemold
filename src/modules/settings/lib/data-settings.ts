import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { SiteSettings, Branch, LegalPage, Stat, SeoData, SectionContent, SiteUiContent, SiteSectionVisibility } from '@/core/types';
import { dbAll, dbGet, parseDbJson } from '@/core/database/db';
import { mergeSectionVisibility, mergeUiContent } from '@/modules/settings/lib/ui-content';
import { logSize, toBoolean } from '@/core/database/data-utils';

function parseContactEmails(value: unknown): string[] {
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

export type CoreSettings = Omit<SiteSettings, 'branches'>;

export const getCoreSettings = cache(unstable_cache(async (): Promise<CoreSettings | null> => {
  const row = await dbGet<Record<string, unknown>>(
    `SELECT * FROM site_settings LIMIT 1`
  );
  if (!row) return null;

  const settings: CoreSettings = {
    id: Number(row.id ?? 1),
    title: String(row.title ?? ''),
    siteUrl: String(row.site_url ?? ''),
    companyName: String(row.company_name ?? ''),
    sector: String(row.sector ?? ''),
    phone: String(row.phone ?? ''),
    email: String(row.email ?? ''),
    contactEmails: parseContactEmails(row.contact_email),
    contactEmail: parseContactEmails(row.contact_email)[0] || String(row.contact_email ?? ''),
    address: String(row.address ?? ''),
    mapsLink: String(row.maps_link ?? ''),
    whatsapp: String(row.whatsapp ?? ''),
    codeInjection: parseDbJson<SiteSettings['codeInjection']>(row.code_injection, {}),
    brand: parseDbJson<SiteSettings['brand']>(row.brand, { logoPath: '', faviconPath: '' }),
    announcement: parseDbJson<SiteSettings['announcement']>(row.announcement, { active: false, text: '', link: '' }),
    navigation: parseDbJson<SiteSettings['navigation']>(row.navigation, []),
    footerLinks: parseDbJson<SiteSettings['footerLinks']>(row.footer_links, []),
    socialMedia: parseDbJson<SiteSettings['socialMedia']>(row.social_media, []),
    footerBottomLinks: parseDbJson<SiteSettings['footerBottomLinks']>(row.footer_bottom_links, []),
    footerLinkGroups: parseDbJson<SiteSettings['footerLinkGroups']>(row.footer_link_groups, []),
    uiContent: mergeUiContent(parseDbJson<Partial<SiteUiContent>>(row.ui_content, {}), String(row.sector ?? '')),
    sectionVisibility: mergeSectionVisibility(parseDbJson<Partial<SiteSectionVisibility>>(row.section_visibility, {})),
    workingHours: row.working_hours ? String(row.working_hours) : '',
    companyDescription: row.company_description ? String(row.company_description) : '',
    emergencyTitle: row.emergency_title ? String(row.emergency_title) : '',
    emergencyDescription: row.emergency_description ? String(row.emergency_description) : '',
    formSuccessTitle: row.form_success_title ? String(row.form_success_title) : '',
    formSuccessDescription: row.form_success_description ? String(row.form_success_description) : '',
    smtp: parseDbJson<SiteSettings['smtp']>(row.smtp, { host: '', port: 587, user: '', pass: '', secure: false }),
    sitemapChunkSize: Number(row.sitemap_chunk_size ?? 0),
    showWhatsApp: toBoolean(row.show_whatsapp, false),
    geoService: row.geo_service as SiteSettings['geoService'] | undefined,
    pseo_mode: row.pseo_mode as SiteSettings['pseo_mode'] | undefined,
    pseo_country: String(row.pseo_country || ''),
    pseo_location_suffix: String(row.pseo_location_suffix || ''),
    pseo_action_verb: String(row.pseo_action_verb || ''),
    pseo_service_suffix: String(row.pseo_service_suffix || ''),
    pseo_ai_enabled: toBoolean(row.pseo_ai_enabled, false),
    pseo_auto_optimize: row.pseo_auto_optimize === 'true' || row.pseo_auto_optimize === true,
    pseo_prompt_template: String(row.pseo_prompt_template || ''),
    ai_provider: row.ai_provider as SiteSettings['ai_provider'] | undefined,
    openrouter_api_key: String(row.openrouter_api_key || ''),
    gemini_api_key: String(row.gemini_api_key || ''),
    ai_model: String(row.ai_model || ''),
    ai_prompt_service: String(row.ai_prompt_service || ''),
    ai_prompt_service_fields: parseDbJson<string[]>(row.ai_prompt_service_fields, ['title', 'description', 'long_description', 'calculator_description', 'seo_title', 'seo_description']),
    ai_prompt_category: String(row.ai_prompt_category || ''),
    ai_prompt_category_fields: parseDbJson<string[]>(row.ai_prompt_category_fields, ['description', 'features']),
    ai_prompt_legal: String(row.ai_prompt_legal || ''),
    ai_prompt_seo_master: String(row.ai_prompt_seo_master || ''),
    globalOgImage: String(row.global_og_image || ''),
    pseo_internal_linking: toBoolean(row.pseo_internal_linking, false),
    pseo_social_proof: toBoolean(row.pseo_social_proof, false),
    pseo_social_proof_min: Number(row.pseo_social_proof_min ?? 0),
    pseo_social_proof_max: Number(row.pseo_social_proof_max ?? 0),
    pseo_social_proof_text: String(row.pseo_social_proof_text || ''),
    pseo_simulated_stats: toBoolean(row.pseo_simulated_stats, false),
    geo_enabled: toBoolean(row.geo_enabled, false),
    geo_faq_enabled: toBoolean(row.geo_faq_enabled, false),
    geo_org_same_as: parseDbJson<string[]>(row.geo_org_same_as, []),
    geo_know_about: String(row.geo_know_about || ''),
    geo_publishing_principles: String(row.geo_publishing_principles || ''),
    geo_founder_name: String(row.geo_founder_name || ''),
    geo_founder_same_as: String(row.geo_founder_same_as || ''),
    geo_prompt_faq: String(row.geo_prompt_faq || ''),
    geo_prompt_summary: String(row.geo_prompt_summary || ''),
    cloudinary_cloud_name: row.cloudinary_cloud_name ? String(row.cloudinary_cloud_name) : undefined,
    cloudinary_api_key: row.cloudinary_api_key ? String(row.cloudinary_api_key) : undefined,
    cloudinary_api_secret: row.cloudinary_api_secret ? String(row.cloudinary_api_secret) : undefined,
    cloudinary_upload_preset: row.cloudinary_upload_preset ? String(row.cloudinary_upload_preset) : undefined,
    faq_visibility: parseDbJson<string[]>(row.faq_visibility, []),
    active_plugins: parseDbJson<string[]>(row.active_plugins, []),
    plugin_configs: parseDbJson<Record<string, any>>(row.plugin_configs, {}),
    gemini_api_keys: parseDbJson<string[]>(row.gemini_api_keys, []),
  };

  return logSize('getCoreSettings', settings);
}, ['v2-core-settings-v3'], { tags: ['settings'], revalidate: 604800 }));

async function getAppearanceRaw(): Promise<string | null> {
  const row = await dbGet<Record<string, unknown>>(
    'SELECT * FROM site_settings LIMIT 1'
  );
  if (!row || typeof row.appearance !== 'string') return null;
  return row.appearance;
}

const getAppearanceTheme = cache(unstable_cache(async (): Promise<string> => {
  const row = await dbGet<Record<string, unknown>>(
    `SELECT * FROM site_settings LIMIT 1`
  );
  if (!row || !row.appearance) return '';
  try {
    let appearanceObj: Record<string, any> = {};
    if (typeof row.appearance === 'string') {
      appearanceObj = JSON.parse(row.appearance);
    } else {
      appearanceObj = row.appearance as Record<string, any>;
    }
    const themeObj = appearanceObj?.theme;
    if (!themeObj || typeof themeObj !== 'object') return '';
    return Object.entries(themeObj as Record<string, string>)
      .map(([key, value]) => `--${key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}: ${value} !important;`)
      .join('\n');
  } catch {
    return '';
  }
}, ['v2-appearance-theme'], { tags: ['appearance'], revalidate: 604800 }));

const getSettings = async (): Promise<SiteSettings | null> => {
  const [coreSettings, branches] = await Promise.all([
    getCoreSettings(),
    getBranches()
  ]);

  if (!coreSettings) return null;

  return {
    ...coreSettings,
    branches
  };
};

const getPublicSettings = async (): Promise<Omit<SiteSettings, 'smtp'> | null> => {
  const full = await getSettings();
  if (!full) return null;
  const { smtp, ...publicFields } = full;
  return publicFields;
};

const getBranches = cache(unstable_cache(async (): Promise<Branch[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT * FROM business_branches ORDER BY sort_order ASC'
  );

  const branches = rows.map((b) => ({
    id: String(b.id ?? ''),
    title: String(b.title ?? ''),
    type: (String(b.type ?? 'sube') as Branch['type']),
    address: String(b.address ?? ''),
    city_name: b.city_name ? String(b.city_name) : undefined,
    city_slug: b.city_slug ? String(b.city_slug) : undefined,
    phone: String(b.phone ?? ''),
    email: String(b.email ?? ''),
    maps_link: String(b.maps_link ?? ''),
    sort_order: Number(b.sort_order ?? 0),
    active: toBoolean(b.active, true),
    amenities: [],
    working_hours: undefined,
  }));
  return logSize('getBranches', branches);
}, ['v2-branches-data'], { tags: ['branches'], revalidate: 604800 }));

const getLegalPages = cache(unstable_cache(async (): Promise<Record<string, LegalPage>> => {
  const rows = await dbAll<Record<string, unknown>>('SELECT * FROM legal_pages');
  const obj: Record<string, LegalPage> = {};
  rows.forEach((l) => {
    const id = String(l.id ?? '');
    if (!id) return;
    obj[id] = {
      title: String(l.title ?? ''),
      metaTitle: String(l.meta_title ?? ''),
      metaDescription: String(l.meta_description ?? ''),
      content: String(l.content ?? ''),
      lastUpdated: String(l.last_updated ?? new Date().toISOString()),
      published: Boolean(l.published ?? true),
    };
  });
  return logSize('getLegalPages', obj);
}, ['v2-legal-data'], { tags: ['legal'], revalidate: 604800 }));

const getStats = cache(unstable_cache(async (): Promise<Stat[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT * FROM stats ORDER BY sort_order ASC'
  );
  const stats = rows.map((s) => ({
    id: s.id ? String(s.id) : undefined,
    label: String(s.label ?? ''),
    value: String(s.value ?? ''),
    order: Number(s.sort_order ?? 0),
  }));
  return logSize('getStats', stats);
}, ['v2-stats-data'], { tags: ['stats'], revalidate: 604800 }));

const getSeoByPage = cache(async (pageKey: string): Promise<SeoData | null> => {
  return unstable_cache(async () => {
    const row = await dbGet<Record<string, unknown>>(
      'SELECT * FROM seo WHERE page_key = ? LIMIT 1',
      [pageKey]
    );
    if (!row) return null;
    return {
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      ogImage: String(row.og_image ?? ''),
    };
  }, ['v2-seo-data-by-page', pageKey], { tags: ['seo'], revalidate: 604800 })();
});

const getLocations = cache(unstable_cache(async () => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT DISTINCT city_slug, city_name FROM business_branches WHERE active = true AND city_slug IS NOT NULL AND city_slug != \'\''
  );

  const locations = rows.map(l => ({
    name: String(l.city_name || ''),
    slug: String(l.city_slug || ''),
  }));

  return logSize('getLocations', locations);
}, ['v2-locations-data'], { tags: ['locations', 'branches'], revalidate: 604800 }));

const getSectionContent = cache(unstable_cache(async (): Promise<Record<string, SectionContent>> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT * FROM section_content'
  );
  const obj: Record<string, SectionContent> = {};
  rows.forEach((s) => {
    const sectionKey = String(s.section_key ?? '');
    if (!sectionKey) return;
    obj[sectionKey] = {
      sectionKey,
      badge: String(s.badge ?? ''),
      title: String(s.title ?? ''),
      subtitle: String(s.subtitle ?? ''),
      content: String(s.content ?? ''),
    };
  });
  return logSize('getSectionContent', obj);
}, ['v2-section-content'], { tags: ['section_content'], revalidate: 604800 }));

const getAllSectionContent = cache(unstable_cache(async (): Promise<SectionContent[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT * FROM section_content ORDER BY section_key ASC'
  );
  const sections = rows.map((s) => ({
    sectionKey: String(s.section_key ?? ''),
    badge: String(s.badge ?? ''),
    title: String(s.title ?? ''),
    subtitle: String(s.subtitle ?? ''),
    content: String(s.content ?? ''),
  }));
  return logSize('getAllSectionContent', sections);
}, ['v2-all-section-content-data'], { tags: ['section_content'], revalidate: 604800 }));

// ─── Shared site_settings row cache ─────────────────────────────────────────
// Tüm admin route'ları aynı `site_settings` satırını farklı kolon altkümeleriyle
// tekrar tekrar sorguluyor (8+ yer). Tek bir cache'li kaynaktan besleniyorlar.

const getSiteSettingsRow = cache(unstable_cache(async () => {
  return dbGet<Record<string, unknown>>('SELECT * FROM site_settings LIMIT 1');
}, ['v2-site-settings-row'], { tags: ['settings'], revalidate: 300 }));

export async function getCloudinaryConfig(): Promise<{
  cloudinary_cloud_name: string;
  cloudinary_api_key: string;
  cloudinary_api_secret: string;
  cloudinary_upload_preset: string;
} | null> {
  const row = await getSiteSettingsRow();
  if (!row) return null;
  return {
    cloudinary_cloud_name: String(row.cloudinary_cloud_name || ''),
    cloudinary_api_key: String(row.cloudinary_api_key || ''),
    cloudinary_api_secret: String(row.cloudinary_api_secret || ''),
    cloudinary_upload_preset: String(row.cloudinary_upload_preset || ''),
  };
}

export async function getAIConfig(): Promise<{
  openrouter_api_key: string;
  openrouter_api_keys: string[];
  gemini_api_key: string;
  gemini_api_keys: string[];
  ai_provider: string;
  company_name: string;
  ai_prompt_service: string;
  ai_prompt_service_fields: string[];
  ai_prompt_category: string;
  ai_prompt_category_fields: string[];
  ai_prompt_legal: string;
  ai_prompt_seo_master: string;
  ai_prompt_faq: string;
  ai_faq_min_count: number;
  ai_prompt_sector_description?: string;
  ai_prompt_sector_json?: string;
  ai_prompt_sector_faq?: string;
  ai_prompt_sector_faq_json?: string;
  ai_sector_faq_min_count?: number;
  ai_model: string;
  openrouter_ai_model: string;
  gemini_ai_model: string;
} | null> {
  const row = await getSiteSettingsRow();
  if (!row) return null;
  return {
    openrouter_api_key: String(row.openrouter_api_key || ''),
    openrouter_api_keys: parseDbJson<string[]>(row.openrouter_api_keys, []),
    gemini_api_key: String(row.gemini_api_key || ''),
    gemini_api_keys: parseDbJson<string[]>(row.gemini_api_keys, []),
    ai_provider: String(row.ai_provider || ''),
    company_name: String(row.company_name || ''),
    ai_prompt_service: String(row.ai_prompt_service || ''),
    ai_prompt_service_fields: parseDbJson<string[]>(row.ai_prompt_service_fields, ['title', 'description', 'long_description', 'calculator_description', 'seo_title', 'seo_description']),
    ai_prompt_category: String(row.ai_prompt_category || ''),
    ai_prompt_category_fields: parseDbJson<string[]>(row.ai_prompt_category_fields, ['description', 'features']),
    ai_prompt_legal: String(row.ai_prompt_legal || ''),
    ai_prompt_seo_master: String(row.ai_prompt_seo_master || ''),
    ai_prompt_faq: String(row.ai_prompt_faq || ''),
    ai_faq_min_count: Number(row.ai_faq_min_count ?? 8),
    ai_prompt_sector_description: String(row.ai_prompt_sector_description || ''),
    ai_prompt_sector_json: String(row.ai_prompt_sector_json || ''),
    ai_prompt_sector_faq: String(row.ai_prompt_sector_faq || ''),
    ai_prompt_sector_faq_json: String(row.ai_prompt_sector_faq_json || ''),
    ai_sector_faq_min_count: Number(row.ai_sector_faq_min_count ?? 5),
    ai_model: String(row.ai_model || ''),
    openrouter_ai_model: String(row.openrouter_ai_model || ''),
    gemini_ai_model: String(row.gemini_ai_model || ''),
  };
}
