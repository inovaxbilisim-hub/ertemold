import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { Service, Reference, HeroData, FAQ, Sector } from '@/core/types';
import { dbAll, dbGet, parseDbJson } from '@/core/database/db';
import { logSize, toBoolean } from '@/core/database/data-utils';

export const getServices = cache(unstable_cache(async (): Promise<Service[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    `SELECT s.id, s.slug, s.title, s.category_id, s.description, s.image_path, s.icon, 
            s.icon_color, s.icon_bg_color, s.color, s.active, s.sort_order, 
            s.pseo_action_verb, s.pseo_service_suffix, s.calculator_enabled, s.calculator_price_per_sqm, s.calculator_description, s.calculator_button_text, s.calculator_disclaimer,
            s.features, s.compatible_sectors,
            c.name as category_name
     FROM services s
     LEFT JOIN service_categories c ON s.category_id = c.id
     WHERE s.active = true
     ORDER BY s.sort_order ASC`
  );
  const services = rows.map((s) => ({
    id: Number(s.id ?? 0),
    slug: String(s.slug ?? ''),
    title: String(s.title ?? ''),
    category_id: Number(s.category_id ?? 0),
    category: String(s.category_name ?? ''),
    description: String(s.description ?? ''),
    longDescription: '',
    imagePath: String(s.image_path ?? ''),
    icon: String(s.icon ?? ''),
    iconColor: String(s.icon_color ?? ''),
    iconBgColor: String(s.icon_bg_color ?? ''),
    features: parseDbJson<string[]>(s.features, []),
    color: String(s.color ?? ''),
    active: toBoolean(s.active, true),
    sortOrder: Number(s.sort_order ?? 0),
    pseo_action_verb: String(s.pseo_action_verb ?? ''),
    pseo_service_suffix: String(s.pseo_service_suffix ?? ''),
    compatible_sectors: parseDbJson<string[]>(s.compatible_sectors, []),
  }));
  return logSize('getServices', services);
}, ['v2-services-data'], { tags: ['services'], revalidate: 604800 }));

export const getServiceDetail = cache(
  unstable_cache(
    async (slug: string): Promise<Service | null> => {
      const s = await dbGet<Record<string, unknown>>(
        'SELECT * FROM services WHERE slug = ? LIMIT 1',
        [slug]
      );
      if (!s) return null;
      return {
        id: Number(s.id ?? 0),
        slug: String(s.slug ?? ''),
        title: String(s.title ?? ''),
        category_id: Number(s.category_id ?? 0),
        description: String(s.description ?? ''),
        longDescription: String(s.long_description ?? ''),
        imagePath: String(s.image_path ?? ''),
        icon: String(s.icon ?? ''),
        iconColor: String(s.icon_color ?? ''),
        iconBgColor: String(s.icon_bg_color ?? ''),
        features: parseDbJson<string[]>(s.features, []),
        color: String(s.color ?? ''),
        seoTitle: s.seo_title ? String(s.seo_title) : undefined,
        seoDescription: s.seo_description ? String(s.seo_description) : undefined,
        active: toBoolean(s.active, true),
        sortOrder: Number(s.sort_order ?? 0),
        pseo_h2_template: s.pseo_h2_template ? String(s.pseo_h2_template) : undefined,
        pseo_action_verb: s.pseo_action_verb ? String(s.pseo_action_verb) : undefined,
        pseo_service_suffix: s.pseo_service_suffix ? String(s.pseo_service_suffix) : undefined,
        calculator_enabled: toBoolean(s.calculator_enabled, false),
        calculator_price_per_sqm: s.calculator_price_per_sqm !== undefined ? Number(s.calculator_price_per_sqm) : null,
        calculator_description: s.calculator_description ? String(s.calculator_description) : undefined,
        calculator_button_text: s.calculator_button_text ? String(s.calculator_button_text) : undefined,
        calculator_disclaimer: s.calculator_disclaimer ? String(s.calculator_disclaimer) : undefined,
        timeline_stages: parseDbJson(s.timeline_stages, null),
        compatible_sectors: parseDbJson(s.compatible_sectors, []),
      };
    },
    ['v2-service-detail'],
    { tags: ['services'], revalidate: 604800 }
  )
);

export const getReferences = cache(unstable_cache(async (): Promise<Reference[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT id, slug, title, sector, short_description, description, logo_path, features, display_order, city_name, city_slug, project_size, project_date, completion_date, featured_image_url, system_type, application_type, concrete_type, challenge, solution, primary_video_url FROM "references" WHERE published = TRUE ORDER BY display_order ASC, title ASC'
  );
  const refs = rows.map((r) => ({
    id: r.id ? String(r.id) : undefined,
    slug: r.slug ? String(r.slug) : undefined,
    name: String(r.title ?? ''),
    sector: String(r.sector ?? ''),
    projectSummary: String(r.short_description ?? ''),
    description: String(r.description ?? ''),
    logoPath: String(r.logo_path ?? ''),
    features: parseDbJson<string[]>(r.features, []),
    active: true,
    city_name: r.city_name ? String(r.city_name) : null,
    city_slug: r.city_slug ? String(r.city_slug) : null,
    project_size: r.project_size ? Number(r.project_size) : null,
    project_date: r.project_date ? String(r.project_date) : null,
    completion_date: r.completion_date ? String(r.completion_date) : null,
    featuredImageUrl: r.featured_image_url ? String(r.featured_image_url) : undefined,
    system_type: r.system_type ? String(r.system_type) : null,
    application_type: r.application_type ? String(r.application_type) : null,
    concrete_type: r.concrete_type ? String(r.concrete_type) : null,
    challenge: r.challenge ? String(r.challenge) : null,
    solution: r.solution ? String(r.solution) : null,
    primary_video_url: r.primary_video_url ? String(r.primary_video_url) : null,
  }));
  return logSize('getReferences', refs);
}, ['v5-references-data'], { tags: ['references'], revalidate: 604800 }));

const getReferencesByCityCached = cache(unstable_cache(async (citySlug: string): Promise<Reference[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT id, slug, title, sector, short_description, description, logo_path, features, display_order, city_name, city_slug, project_size, project_date, completion_date, featured_image_url, system_type, application_type, concrete_type, challenge, solution, primary_video_url FROM "references" WHERE published = TRUE AND city_slug = $1 ORDER BY display_order ASC, title ASC',
    [citySlug]
  );
  const refs = rows.map((r) => ({
    id: r.id ? String(r.id) : undefined,
    slug: r.slug ? String(r.slug) : undefined,
    name: String(r.title ?? ''),
    sector: String(r.sector ?? ''),
    projectSummary: String(r.short_description ?? ''),
    description: String(r.description ?? ''),
    logoPath: String(r.logo_path ?? ''),
    features: parseDbJson<string[]>(r.features, []),
    active: true,
    city_name: r.city_name ? String(r.city_name) : null,
    city_slug: r.city_slug ? String(r.city_slug) : null,
    project_size: r.project_size ? Number(r.project_size) : null,
    project_date: r.project_date ? String(r.project_date) : null,
    completion_date: r.completion_date ? String(r.completion_date) : null,
    featuredImageUrl: r.featured_image_url ? String(r.featured_image_url) : undefined,
    system_type: r.system_type ? String(r.system_type) : null,
    application_type: r.application_type ? String(r.application_type) : null,
    concrete_type: r.concrete_type ? String(r.concrete_type) : null,
    challenge: r.challenge ? String(r.challenge) : null,
    solution: r.solution ? String(r.solution) : null,
    primary_video_url: r.primary_video_url ? String(r.primary_video_url) : null,
  }));
  return logSize(`getReferencesByCityCached:${citySlug}`, refs);
}, ['v5-references-city'], { tags: ['references'], revalidate: 604800 }));

// Sadece ham DB verisini cache'le
const getRawCityStats = cache(unstable_cache(async (citySlug: string) => {
  const rows = await dbAll<Record<string, unknown>>(
    `SELECT 
      COUNT(*) as total_projects, 
      SUM(project_size) as total_sqm,
      MODE() WITHIN GROUP (ORDER BY system_type) as favorite_system
     FROM "references" 
     WHERE published = TRUE AND city_slug = $1`,
    [citySlug]
  );
  return {
    totalProjects: Number(rows[0]?.total_projects || 0),
    totalSqm: Number(rows[0]?.total_sqm || 0),
    favoriteSystem: rows[0]?.favorite_system ? String(rows[0].favorite_system) : null,
  };
}, ['v7-city-stats-raw'], { tags: ['references'], revalidate: 604800 }));

// Simulated stats removed - only show real data from database
export async function getCityStats(citySlug: string) {
  const raw = await getRawCityStats(citySlug);
  
  // Return only real data from references table
  // If no real data exists, return zeros (don't fabricate)
  return {
    totalProjects: raw.totalProjects,
    totalSqm: raw.totalSqm,
    favoriteSystem: raw.favoriteSystem
  };
}

// Get city-specific FAQs
export async function getCityFAQs(citySlug: string, serviceSlug: string): Promise<any[]> {
  try {
    const rows = await dbAll<Record<string, unknown>>(
      `SELECT id, question, answer, category, generated_at, updated_at
       FROM city_faqs
       WHERE city_slug = $1 AND service_slug = $2 AND active = true
       ORDER BY generated_at DESC`,
      [citySlug, serviceSlug]
    );

    return rows.map(row => ({
      id: row.id,
      question: String(row.question || ''),
      answer: String(row.answer || ''),
      category: String(row.category || 'location'),
      active: true,
      generatedAt: row.generated_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error('[getCityFAQs] Error:', error);
    return [];
  }
}

// Get city industry profile (cached)
export async function getCityIndustryProfile(citySlug: string, serviceSlug?: string) {
  try {
    const row = await dbGet<Record<string, unknown>>(
      `SELECT * FROM city_industry_profiles
       WHERE city_slug = $1 AND (service_slug = $2 OR service_slug IS NULL) AND active = true
       ORDER BY service_slug DESC
       LIMIT 1`,
      [citySlug, serviceSlug || null]
    );

    if (!row) return null;

    return {
      id: row.id,
      citySlug: String(row.city_slug),
      cityName: String(row.city_name),
      serviceSlug: row.service_slug ? String(row.service_slug) : null,
      dominantSectors: parseDbJson(row.dominant_sectors, []),
      typicalNeeds: parseDbJson(row.typical_needs, []),
      recommendedSystems: parseDbJson(row.recommended_systems, []),
      localChallenges: parseDbJson(row.local_challenges, []),
      floorRequirements: {
        heavyTraffic: toBoolean(row.heavy_traffic),
        chemicalResistance: toBoolean(row.chemical_resistance),
        hygiene: toBoolean(row.hygiene),
        dustControl: toBoolean(row.dust_control),
      },
      analysisText: row.analysis_text ? String(row.analysis_text) : null,
      generatedAt: row.generated_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error('[getCityIndustryProfile] Error:', error);
    return null;
  }
}

// Get city case studies from DB cache
export async function getCityCaseStudiesData(citySlug: string, serviceSlug: string) {
  try {
    const rows = await dbAll<Record<string, unknown>>(
      `SELECT * FROM city_case_studies
       WHERE city_slug = $1 AND service_slug = $2 AND active = true
       ORDER BY created_at DESC
       LIMIT 3`,
      [citySlug, serviceSlug]
    );

    return rows.map(r => ({
      id: String(r.id),
      citySlug: String(r.city_slug),
      cityName: String(r.city_name),
      serviceSlug: String(r.service_slug),
      referenceId: Number(r.reference_id),
      referenceSlug: String(r.reference_slug),
      projectTitle: String(r.project_title),
      sector: r.sector ? String(r.sector) : null,
      projectSize: r.project_size ? Number(r.project_size) : null,
      projectDate: r.project_date ? String(r.project_date) : null,
      systemType: r.system_type ? String(r.system_type) : null,
      challenge: r.challenge ? String(r.challenge) : null,
      solution: r.solution ? String(r.solution) : null,
      storyTitle: String(r.story_title || r.project_title),
      storyContext: String(r.story_context || ''),
      storyChallenge: String(r.story_challenge || ''),
      storySolution: String(r.story_solution || ''),
      storyResult: String(r.story_result || ''),
      generatedAt: new Date(String(r.created_at)),
    }));
  } catch (error) {
    console.error('[getCityCaseStudiesData] Error:', error);
    return [];
  }
}

export const getReferenceDetail = cache(unstable_cache(async (slug: string): Promise<Reference | null> => {
  const r = await dbGet<Record<string, unknown>>(
    'SELECT * FROM "references" WHERE slug = $1 AND published = TRUE',
    [slug]
  );
  if (!r) return null;
  const ref = {
    id: r.id ? String(r.id) : undefined,
    name: String(r.title ?? ''),
    sector: String(r.sector ?? ''),
    projectSummary: String(r.short_description ?? ''),
    description: String(r.description ?? ''),
    logoPath: String(r.logo_path ?? ''),
    features: parseDbJson<string[]>(r.features, []),
    active: true,
    city_name: r.city_name ? String(r.city_name) : null,
    city_slug: r.city_slug ? String(r.city_slug) : null,
    service_slug: r.service_slug ? String(r.service_slug) : null,
    project_size: r.project_size ? Number(r.project_size) : null,
    project_date: r.project_date ? String(r.project_date) : null,
    completion_date: r.completion_date ? String(r.completion_date) : null,
    featuredImageUrl: r.featured_image_url ? String(r.featured_image_url) : undefined,
    beforeImageUrl: r.before_image_url ? String(r.before_image_url) : undefined,
    afterImageUrl: r.after_image_url ? String(r.after_image_url) : undefined,
    
    // Technical AI Fields
    system_type: r.system_type ? String(r.system_type) : null,
    application_type: r.application_type ? String(r.application_type) : null,
    forklift_traffic: r.forklift_traffic ? String(r.forklift_traffic) : null,
    concrete_type: r.concrete_type ? String(r.concrete_type) : null,
    moisture_problem: toBoolean(r.moisture_problem),
    coating_thickness_mm: r.coating_thickness_mm ? Number(r.coating_thickness_mm) : null,
    coverage_rate_sqm_kg: r.coverage_rate_sqm_kg ? Number(r.coverage_rate_sqm_kg) : null,
    curing_time_hours: r.curing_time_hours ? Number(r.curing_time_hours) : null,
    challenge: r.challenge ? String(r.challenge) : null,
    solution: r.solution ? String(r.solution) : null,
    primary_video_url: r.primary_video_url ? String(r.primary_video_url) : null,
    team_visible: toBoolean(r.team_visible),
  };
  return logSize('getReferenceDetail', ref as Reference);
}, ['v5-reference-detail'], { tags: ['references'], revalidate: 604800 }));


const getHeroIntro = cache(unstable_cache(async (): Promise<HeroData> => {
  const row = await dbGet<Record<string, unknown>>(
    'SELECT * FROM hero_intro LIMIT 1'
  );

  if (!row) {
    return {
      active: true,
      left: { badge: '', title: '', description: '', ctaText: '', ctaLink: '', ctaSecondaryText: '', ctaSecondaryLink: '' },
      gallery: [],
    };
  }

  const hero = {
    id: row.id ? Number(row.id) : undefined,
    active: toBoolean(row.active, true),
    left: {
      badge: String(row.badge ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      ctaText: String(row.cta_text ?? ''),
      ctaLink: String(row.cta_link ?? ''),
      ctaSecondaryText: String(row.cta_secondary_text ?? ''),
      ctaSecondaryLink: String(row.cta_secondary_link ?? ''),
    },
    gallery: parseDbJson<HeroData['gallery']>(row.gallery, []),
    galleryLayout: (row.gallery_layout as 'masonry' | 'grid') || 'masonry',
    galleryCount: Number(row.gallery_count ?? 4),
  };
  return logSize('getHeroIntro', hero);
}, ['v2-hero-data'], { tags: ['hero'], revalidate: 604800 }));

export const getServiceCategories = cache(unstable_cache(async () => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT id, slug, name, description, icon, sort_order, active FROM service_categories ORDER BY sort_order ASC'
  );
  const categories = rows.map((c) => ({
    id: Number(c.id ?? 0),
    slug: String(c.slug ?? ''),
    name: String(c.name ?? ''),
    description: String(c.description ?? ''),
    icon: String(c.icon ?? ''),
    sort_order: Number(c.sort_order ?? 0),
    active: toBoolean(c.active, true),
  }));
  return logSize('getServiceCategories', categories);
}, ['v2-service-categories'], { tags: ['services'], revalidate: 604800 }));

const getFaqs = cache(unstable_cache(async (): Promise<FAQ[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT id, question, answer, active, sort_order, category, display_pages FROM faqs WHERE active = 1 ORDER BY sort_order ASC'
  );
  const faqs = rows.map((f) => ({
    id: String(f.id ?? ''),
    question: String(f.question ?? ''),
    answer: String(f.answer ?? ''),
    active: toBoolean(f.active, true),
    sort_order: Number(f.sort_order ?? 0),
    category: String(f.category ?? ''),
    display_pages: parseDbJson<string[]>(f.display_pages, []),
  }));
  return logSize('getFaqs', faqs);
}, ['faqs-data-v2'], { tags: ['faqs'], revalidate: 604800 }));

const getFaqsForPage = async (pageId: string) => {
  const allFaqs = await getFaqs();
  if (pageId === 'pseo') {
    // pSEO için tüm aktif S.S.S'leri gönder, filtrelemeyi akıllı plugin (Smart FAQ) yapacak
    return allFaqs;
  }
  return allFaqs.filter(f => f.display_pages?.includes(pageId));
};

const getSectors = cache(unstable_cache(async (): Promise<Sector[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT id, name, slug, description, sort_order, active, image_path, ui_metadata FROM sectors WHERE active = true ORDER BY sort_order ASC'
  );
  const sectors = rows.map((s) => ({
    id: String(s.id ?? ''),
    name: String(s.name ?? ''),
    slug: String(s.slug ?? ''),
    description: String(s.description ?? ''),
    icon: undefined, // Sectors table doesn't have icon column
    sort_order: Number(s.sort_order ?? 0),
    active: toBoolean(s.active, true),
    image_path: s.image_path ? String(s.image_path) : undefined,
    ui_metadata: s.ui_metadata ? String(s.ui_metadata) : undefined,
  }));
  return logSize('getSectors', sectors);
}, ['v2-sectors-data'], { tags: ['sectors'], revalidate: 604800 }));
