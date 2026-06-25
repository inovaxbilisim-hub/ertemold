import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { Service, Reference, HeroData, FAQ, Sector } from '@/core/types';
import { dbAll, dbGet, parseDbJson } from '@/core/database/db';
import { logSize, toBoolean } from '@/core/database/data-utils';

export const getServices = cache(unstable_cache(async (): Promise<Service[]> => {
  let rows: Record<string, unknown>[];
  try {
    rows = await dbAll<Record<string, unknown>>(
      `SELECT s.id, s.slug, s.title, s.category_id, s.description, s.image_path, s.icon, 
              s.icon_color, s.icon_bg_color, s.color, s.active, s.sort_order, 
              s.pseo_action_verb, s.pseo_service_suffix, s.features, s.compatible_sectors, s.service_faqs,
              c.name as category_name
       FROM services s
       LEFT JOIN service_categories c ON s.category_id = c.id
       WHERE s.active = true
       ORDER BY s.sort_order ASC`
    );
  } catch (error: unknown) {
    const message = String(error instanceof Error ? error.message : error);
    if (message.toLowerCase().includes('service_faqs') && message.toLowerCase().includes('does not exist')) {
      rows = await dbAll<Record<string, unknown>>(
        `SELECT s.id, s.slug, s.title, s.category_id, s.description, s.image_path, s.icon, 
                s.icon_color, s.icon_bg_color, s.color, s.active, s.sort_order, 
                s.pseo_action_verb, s.pseo_service_suffix, s.features, s.compatible_sectors,
                c.name as category_name
         FROM services s
         LEFT JOIN service_categories c ON s.category_id = c.id
         WHERE s.active = true
         ORDER BY s.sort_order ASC`
      );
    } else {
      throw error;
    }
  }

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
    serviceFaqs: parseDbJson<FAQ[]>(s.service_faqs, []),
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
        timeline_stages: parseDbJson(s.timeline_stages, null),
        compatible_sectors: parseDbJson(s.compatible_sectors, []),
        serviceFaqs: parseDbJson<FAQ[]>(s.service_faqs, []),
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

async function getCityStats(citySlug: string) {
  const raw = await getRawCityStats(citySlug);
  
  // Return only real data from references table
  // If no real data exists, return zeros (don't fabricate)
  return {
    totalProjects: raw.totalProjects,
    totalSqm: raw.totalSqm,
    favoriteSystem: raw.favoriteSystem
  };
}

const getReferenceDetail = cache(unstable_cache(async (slug: string): Promise<Reference | null> => {
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

export const getHeroIntro = cache(unstable_cache(async (): Promise<HeroData> => {
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

export const getFaqs = cache(unstable_cache(async (): Promise<FAQ[]> => {
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

export const getFaqsForPage = async (pageId: string) => {
  const allFaqs = await getFaqs();
  if (pageId === 'pseo') {
    return allFaqs;
  }
  return allFaqs.filter(f => f.display_pages?.includes(pageId));
};

export const getSectors = cache(unstable_cache(async (): Promise<Sector[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT id, name, slug, description, sort_order, active, image_path, ui_metadata FROM sectors WHERE active = true ORDER BY sort_order ASC'
  );
  const relations = await dbAll<Record<string, unknown>>(
    'SELECT sector_id, service_id FROM sector_services'
  );

  const sectors = rows.map((s) => {
    const rIds = relations.filter(r => r.sector_id === s.id).map(r => Number(r.service_id));
    return {
      id: String(s.id ?? ''),
      name: String(s.name ?? ''),
      slug: String(s.slug ?? ''),
      description: String(s.description ?? ''),
      icon: undefined,
      sort_order: Number(s.sort_order ?? 0),
      active: toBoolean(s.active, true),
      image_path: s.image_path ? String(s.image_path) : undefined,
      ui_metadata: s.ui_metadata ? String(s.ui_metadata) : undefined,
      recommended_service_ids: rIds,
    };
  });
  return logSize('getSectors', sectors);
}, ['v2-sectors-data-relations'], { tags: ['sectors'], revalidate: 604800 }));
