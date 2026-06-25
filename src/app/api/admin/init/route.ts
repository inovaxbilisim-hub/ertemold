import { ok, serverError, unauthorized } from '@/core/api/response';
import { verifySession } from '@/core/auth/auth';
import { dbAll, ensureTableColumn } from '@/core/database/db';
import { defaultSectionVisibility, mergeUiContent } from '@/modules/settings/lib/ui-content';
import type { FAQ } from '@/core/types';

export const dynamic = 'force-dynamic';

function parseJson<T>(val: unknown, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return val as T;
}

function parseList(val: unknown): unknown[] {
  if (!val) return [];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through to comma-separated parsing
    }
    return val
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return Array.isArray(val) ? val : [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedTabs = searchParams.get('tabs')?.split(',') || [];
  
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const all = requestedTabs.length === 0;

    // Kolonlar eksikse ekle (idempotent migration)
    await ensureTableColumn('services', 'timeline_stages', 'TEXT');
    await ensureTableColumn('services', 'compatible_sectors', 'TEXT');
    await ensureTableColumn('services', 'service_faqs', 'TEXT');
    await ensureTableColumn('services', 'calculator_enabled', 'BOOLEAN DEFAULT FALSE');
    await ensureTableColumn('services', 'calculator_price_per_sqm', 'REAL');
    await ensureTableColumn('services', 'calculator_description', 'TEXT');
    await ensureTableColumn('services', 'calculator_button_text', 'TEXT');
    await ensureTableColumn('services', 'calculator_disclaimer', 'TEXT');
    await ensureTableColumn('sectors', 'description', 'TEXT');
    await ensureTableColumn('site_settings', 'gemini_api_keys', 'TEXT');
    await ensureTableColumn('site_settings', 'openrouter_api_keys', 'TEXT');
    await ensureTableColumn('site_settings', 'openrouter_ai_model', 'TEXT');
    await ensureTableColumn('site_settings', 'gemini_ai_model', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_service_fields', 'TEXT');
    await ensureTableColumn('site_settings', 'ai_prompt_category_fields', 'TEXT');

    // seo tablosunda page_key üzerinde unique constraint yoksa ekle (ON CONFLICT için gerekli)
    try {
      await dbAll(`
        ALTER TABLE seo ADD CONSTRAINT seo_page_key_unique UNIQUE (page_key)
      `);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (!msg.toLowerCase().includes('already exists') && !msg.includes('42P07')) {
        // Gerçek bir hata — logla ama uygulamayı durdurma
        console.warn('[admin/init] seo constraint warning:', msg);
      }
    }

    // Tüm sorguları paralel çalıştır (Promise.all)
    const [settingsRows, servicesData, referencesData, statsData, branchesData, pagesData, categoriesData, heroRows, legalData, seoData, sectionsData, faqData, sectorsData, citiesData] = await Promise.all([
      all || requestedTabs.includes('settings') || requestedTabs.includes('design') ? dbAll<Record<string, unknown>>('SELECT * FROM site_settings LIMIT 1') : Promise.resolve([]),
      all || requestedTabs.includes('services') ? dbAll<Record<string, unknown>>('SELECT * FROM services ORDER BY sort_order ASC') : Promise.resolve([]),
      all || requestedTabs.includes('references') ? dbAll<Record<string, unknown>>(`SELECT * FROM "references" ORDER BY display_order ASC, title ASC`) : [],
      all || requestedTabs.includes('stats') ? dbAll<Record<string, unknown>>('SELECT * FROM stats ORDER BY sort_order ASC') : [],
      all || requestedTabs.includes('branches') ? dbAll<Record<string, unknown>>('SELECT * FROM business_branches ORDER BY sort_order ASC') : [],
      all || requestedTabs.includes('pages') ? dbAll<Record<string, unknown>>('SELECT * FROM pages ORDER BY id ASC') : [],
      // categories: services tabı seçiliyse otomatik gelir
      (all || requestedTabs.includes('categories') || requestedTabs.includes('services')) ? dbAll<Record<string, unknown>>('SELECT * FROM service_categories ORDER BY sort_order ASC') : [],
      all || requestedTabs.includes('hero') ? dbAll<Record<string, unknown>>('SELECT * FROM hero_intro LIMIT 1') : [],
      all || requestedTabs.includes('legal') ? dbAll<Record<string, unknown>>('SELECT * FROM legal_pages') : [],
      all || requestedTabs.includes('seo') ? dbAll<Record<string, unknown>>('SELECT * FROM seo') : [],
      all || requestedTabs.includes('sections') ? dbAll<Record<string, unknown>>('SELECT * FROM section_content ORDER BY section_key ASC') : [],
      all || requestedTabs.includes('faqs') ? dbAll<Record<string, unknown>>('SELECT * FROM faqs ORDER BY sort_order ASC') : [],
      // sectors her zaman istenir (küçük tablo, referans ve servis formlarında gerekir)
      dbAll<Record<string, unknown>>('SELECT * FROM sectors ORDER BY sort_order ASC'),
      // cities her zaman istenir (referans formunda şehir dropdown için)
      dbAll<Record<string, unknown>>('SELECT id, name, slug, plate_code FROM cities WHERE active = TRUE ORDER BY plate_code::int ASC'),
    ]);

    const settingsData = settingsRows[0];
    const heroData = heroRows;

    // Parse Settings
    let parsedSettings = null;
    if (settingsData) {
      parsedSettings = {
        ...settingsData,
        companyName: settingsData.company_name,
        mapsLink: settingsData.maps_link,
        codeInjection: parseJson(settingsData.code_injection, {}),
        brand: parseJson(settingsData.brand, { logoPath: '', faviconPath: '' }),
        announcement: parseJson(settingsData.announcement, { active: false, text: '', link: '' }),
        navigation: parseJson(settingsData.navigation, []),
        smtp: parseJson(settingsData.smtp, { host: '', port: 587, user: '', pass: '', secure: false }),
        footerLinks: parseJson(settingsData.footer_links, []),
        footerBottomLinks: parseJson(settingsData.footer_bottom_links, []),
        socialMedia: parseJson(settingsData.social_media, []),
        contactEmails: parseList(settingsData.contact_email).map(String),
        contactEmail: String(parseList(settingsData.contact_email)[0] || settingsData.contact_email || ''),
        uiContent: mergeUiContent(parseJson(settingsData.ui_content, {})),
        sectionVisibility: parseJson(settingsData.section_visibility, defaultSectionVisibility),
        showWhatsApp: Boolean(settingsData.show_whatsapp),
        pseo_auto_optimize: settingsData.pseo_auto_optimize === 'true' || settingsData.pseo_auto_optimize === true,
        pseo_ai_enabled: Boolean(settingsData.pseo_ai_enabled),
        pseo_internal_linking: Boolean(settingsData.pseo_internal_linking),
        pseo_social_proof: Boolean(settingsData.pseo_social_proof),
        pseo_social_proof_min: Number(settingsData.pseo_social_proof_min ?? 0),
        pseo_social_proof_max: Number(settingsData.pseo_social_proof_max ?? 0),
        pseo_social_proof_text: settingsData.pseo_social_proof_text || '',
        geo_enabled: Boolean(settingsData.geo_enabled),
        geo_faq_enabled: Boolean(settingsData.geo_faq_enabled),
        geo_org_same_as: parseJson(settingsData.geo_org_same_as, []),
        geo_know_about: settingsData.geo_know_about || '',
        geo_publishing_principles: settingsData.geo_publishing_principles || '',
        geo_founder_name: settingsData.geo_founder_name || '',
        geo_founder_same_as: settingsData.geo_founder_same_as || '',
        geo_prompt_faq: settingsData.geo_prompt_faq || '',
        geo_prompt_summary: settingsData.geo_prompt_summary || '',
        sitemapChunkSize: Number(settingsData.sitemap_chunk_size ?? settingsData.sitemapChunkSize ?? 0),
        geoService: settingsData.geo_service ?? '',
        workingHours: settingsData.working_hours ?? '',
        companyDescription: settingsData.company_description ?? '',
        pseo_mode: settingsData.pseo_mode ?? '',
        pseo_country: settingsData.pseo_country ?? '',
        pseo_location_suffix: settingsData.pseo_location_suffix ?? '',
        pseo_action_verb: settingsData.pseo_action_verb || '',
        pseo_service_suffix: settingsData.pseo_service_suffix || '',
        pseo_prompt_template: settingsData.pseo_prompt_template || '',
        ai_provider: settingsData.ai_provider ?? '',
        ai_model: settingsData.ai_model || '',
        openrouter_ai_model: settingsData.openrouter_ai_model || '',
        gemini_ai_model: settingsData.gemini_ai_model || '',
        openrouter_api_key: settingsData.openrouter_api_key || '',
        openrouter_api_keys: parseList(settingsData.openrouter_api_keys),
        gemini_api_key: settingsData.gemini_api_key || '',
        gemini_api_keys: parseList(settingsData.gemini_api_keys),
        ai_prompt_service: settingsData.ai_prompt_service || '',
        ai_prompt_category: settingsData.ai_prompt_category || '',
        ai_prompt_service_fields: parseJson(settingsData.ai_prompt_service_fields, ['title', 'description', 'long_description', 'calculator_description', 'seo_title', 'seo_description']),
        ai_prompt_category_fields: parseJson(settingsData.ai_prompt_category_fields, ['description', 'features']),
        ai_prompt_legal: settingsData.ai_prompt_legal || '',
        ai_prompt_seo_master: settingsData.ai_prompt_seo_master || '',
        ai_prompt_faq: settingsData.ai_prompt_faq || '',
        ai_prompt_sector_description: settingsData.ai_prompt_sector_description || '',
        ai_prompt_sector_json: settingsData.ai_prompt_sector_json || '',
        ai_prompt_sector_faq: settingsData.ai_prompt_sector_faq || '',
        ai_prompt_sector_faq_json: settingsData.ai_prompt_sector_faq_json || '',
        ai_sector_faq_min_count: Number(settingsData.ai_sector_faq_min_count ?? 3),
        ai_faq_min_count: Number(settingsData.ai_faq_min_count ?? 8),
        globalOgImage: settingsData.global_og_image || '',
        faq_visibility: parseList(settingsData.faq_visibility),
        cloudinary_cloud_name: settingsData.cloudinary_cloud_name || '',
        cloudinary_api_key: settingsData.cloudinary_api_key || '',
        cloudinary_api_secret: settingsData.cloudinary_api_secret || '',
        cloudinary_upload_preset: settingsData.cloudinary_upload_preset || '',
        active_plugins: parseList(settingsData.active_plugins),
        plugin_configs: parseJson(settingsData.plugin_configs, {}),
      };
    }

    // Assemble payload
    const data = {
      settings: parsedSettings,
      services: servicesData.map((s: any) => ({
        ...s,
        active: Boolean(s.active),
        sortOrder: s.sort_order || 0,
        longDescription: s.long_description,
        imagePath: s.image_path,
        iconColor: s.icon_color,
        iconBgColor: s.icon_bg_color,
        features: parseList(s.features),
        seoTitle: s.seo_title,
        seoDescription: s.seo_description,
        timeline_stages: s.timeline_stages ? parseJson(s.timeline_stages, null) : null,
        compatible_sectors: s.compatible_sectors ? parseJson(s.compatible_sectors, []) : [],
        serviceFaqs: s.service_faqs ? parseJson<FAQ[]>(s.service_faqs, []) : [],
      })),
      references: referencesData.map((r: any) => ({
        id: String(r.id),
        name: r.title || '',
        sector: r.sector || '',
        projectSummary: r.short_description || '',
        description: r.description || '',
        logoPath: r.logo_path || '',
        features: parseList(r.features),
        active: Boolean(r.published),
        published: Boolean(r.published),
        featured: Boolean(r.featured),
        sortOrder: r.display_order || 0,
        featuredImageUrl: r.featured_image_url || '',
        beforeImageUrl: r.before_image_url || '',
        afterImageUrl: r.after_image_url || '',
        city_name: r.city_name || '',
        city_slug: r.city_slug || '',
        service_slug: r.service_slug || '',
        project_size: r.project_size,
        project_date: r.project_date,
        completion_date: r.completion_date,
        project_location: r.project_location || '',
        system_type: r.system_type || '',
        application_type: r.application_type || '',
        forklift_traffic: r.forklift_traffic || '',
        concrete_type: r.concrete_type || '',
        moisture_problem: Boolean(r.moisture_problem),
        coating_thickness_mm: r.coating_thickness_mm,
        coverage_rate_sqm_kg: r.coverage_rate_sqm_kg,
        curing_time_hours: r.curing_time_hours,
        challenge: r.challenge || '',
        solution: r.solution || '',
        primary_video_url: r.primary_video_url || '',
        team_visible: Boolean(r.team_visible),
      })),
      stats: statsData.map((s: any) => ({ ...s, order: s.sort_order })),
      branches: branchesData.map((b: any) => ({
        ...b,
        active: Boolean(b.active),
        working_hours: parseJson(b.working_hours, {}),
        amenities: parseList(b.amenities),
      })),
      pages: pagesData.map((p: any) => ({
        ...p,
        meta_title: p.meta_title || '',
        meta_description: p.meta_description || '',
        content_data: parseJson(p.content_data, {}),
        is_published: Boolean(p.is_published),
      })),
      categories: categoriesData.map((c: any) => ({
        ...c,
        active: Boolean(c.active),
        features: parseList(c.features)
      })),
      hero: heroData[0] ? {
        ...heroData[0],
        active: Boolean(heroData[0].active),
        left: {
          badge: heroData[0].badge,
          title: heroData[0].title,
          description: heroData[0].description,
          ctaText: heroData[0].cta_text,
          ctaLink: heroData[0].cta_link,
          ctaSecondaryText: heroData[0].cta_secondary_text,
          ctaSecondaryLink: heroData[0].cta_secondary_link,
        },
        gallery: parseList(heroData[0].gallery),
        galleryLayout: heroData[0].gallery_layout || 'masonry',
        galleryCount: heroData[0].gallery_count || 4,
      } : { active: true, left: {}, gallery: [] },
      legal: Object.fromEntries(legalData.map((l: any) => [String(l.id), {
        title: l.title,
        metaTitle: l.meta_title,
        metaDescription: l.meta_description,
        content: l.content || '',
        lastUpdated: String(l.last_updated ?? new Date().toISOString()),
        published: Boolean(l.published),
      }])),
      seo: Object.fromEntries(seoData.map((s: any) => [String(s.page_key), {
        title: s.title,
        description: s.description,
        ogImage: s.og_image,
      }])),
      sections: sectionsData.map((s: any) => ({
        ...s,
        sectionKey: s.section_key,
        badge: s.badge,
        title: s.title,
        subtitle: s.subtitle,
        content: s.content || ''
      })),
      faqs: faqData.map((f: any) => ({
        ...f,
        active: Boolean(f.active),
        display_pages: parseList(f.display_pages)
      })),
      sectors: sectorsData.map((s: any) => ({
        ...s,
        active: Boolean(s.active),
      })),
      cities: citiesData.map((c: any) => ({
        id: Number(c.id),
        name: String(c.name),
        slug: String(c.slug),
        plate_code: c.plate_code ? String(c.plate_code) : null,
      })),
    };

    return ok(data);
  } catch (error: unknown) {
    console.error('[admin/init] GET failed:', error);
    return serverError(error);
  }
}
