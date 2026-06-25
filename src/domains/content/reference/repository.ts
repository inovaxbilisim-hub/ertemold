import 'server-only';
import { dbAll, dbBatch } from '@/core/database/db';
import type { Reference, ReferenceAdmin, ReferenceCreateInput } from './types';

// Mevcut /api/admin/references route'undan taşındı
// Birleşik CRUD — tek doğruluk kaynağı

function parseJson(val: unknown): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') try { return JSON.parse(val); } catch { return []; }
  return [];
}

function toBoolean(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  return val === 'true' || val === '1' || val === true || val === 1;
}

// ——— PUBLIC ———
export async function getPublishedReferences(): Promise<Reference[]> {
  const rows = await dbAll<any>(
    'SELECT * FROM "references" WHERE published = TRUE ORDER BY display_order ASC, title ASC'
  );
  return rows.map(rowToReference);
}

export async function getReferencesByCity(citySlug: string): Promise<Reference[]> {
  const rows = await dbAll<any>(
    'SELECT * FROM "references" WHERE published = TRUE AND city_slug = $1 ORDER BY display_order ASC, title ASC',
    [citySlug]
  );
  return rows.map(rowToReference);
}

export async function getReferencesByService(serviceSlug: string): Promise<Reference[]> {
  const rows = await dbAll<any>(
    'SELECT * FROM "references" WHERE published = TRUE AND service_slug = $1 ORDER BY display_order ASC, title ASC',
    [serviceSlug]
  );
  return rows.map(rowToReference);
}

// ——— ADMIN ———
export async function getAllReferences(): Promise<ReferenceAdmin[]> {
  const rows = await dbAll<any>(
    `SELECT id, slug, title, short_description, description, city_name, city_slug, service_slug, 
     project_size, project_date, completion_date, featured_image_url, before_image_url, after_image_url, 
     logo_path, sector, features, featured, published, display_order,
     project_location, system_type, application_type, forklift_traffic, 
     concrete_type, moisture_problem, coating_thickness_mm, coverage_rate_sqm_kg, curing_time_hours,
     challenge, solution, primary_video_url, team_visible,
     created_at, updated_at 
     FROM "references" ORDER BY display_order ASC, title ASC`
  );
  return rows.map(rowToAdmin);
}

export async function deleteReference(id: number): Promise<void> {
  const { dbRun } = await import('@/core/database/db');
  await dbRun('DELETE FROM "references" WHERE id = $1', [id]);
}

function nullIfEmpty(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  return str === '' ? null : str;
}

export async function upsertReference(data: ReferenceCreateInput): Promise<void> {
  const slugSafe = data.name
    ? data.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^[-]+|[-]+$/g, '')
    : `ref-${Date.now()}`;

  await dbBatch([{
    sql: `INSERT INTO "references" (
      slug, title, sector, short_description, description, logo_path, features, published, featured, display_order, 
      featured_image_url, before_image_url, after_image_url, city_name, city_slug, service_slug, 
      project_size, project_date, completion_date,
      project_location, system_type, application_type, forklift_traffic,
      concrete_type, moisture_problem, coating_thickness_mm, coverage_rate_sqm_kg, curing_time_hours,
      challenge, solution, primary_video_url, team_visible
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      sector = EXCLUDED.sector,
      short_description = EXCLUDED.short_description,
      description = EXCLUDED.description,
      logo_path = EXCLUDED.logo_path,
      features = EXCLUDED.features,
      published = EXCLUDED.published,
      featured = EXCLUDED.featured,
      display_order = EXCLUDED.display_order,
      featured_image_url = EXCLUDED.featured_image_url,
      before_image_url = EXCLUDED.before_image_url,
      after_image_url = EXCLUDED.after_image_url,
      city_name = EXCLUDED.city_name,
      city_slug = EXCLUDED.city_slug,
      service_slug = EXCLUDED.service_slug,
      project_size = EXCLUDED.project_size,
      project_date = EXCLUDED.project_date,
      completion_date = EXCLUDED.completion_date,
      project_location = EXCLUDED.project_location,
      system_type = EXCLUDED.system_type,
      application_type = EXCLUDED.application_type,
      forklift_traffic = EXCLUDED.forklift_traffic,
      concrete_type = EXCLUDED.concrete_type,
      moisture_problem = EXCLUDED.moisture_problem,
      coating_thickness_mm = EXCLUDED.coating_thickness_mm,
      coverage_rate_sqm_kg = EXCLUDED.coverage_rate_sqm_kg,
      curing_time_hours = EXCLUDED.curing_time_hours,
      challenge = EXCLUDED.challenge,
      solution = EXCLUDED.solution,
      primary_video_url = EXCLUDED.primary_video_url,
      team_visible = EXCLUDED.team_visible`,
    args: [
      slugSafe, 
      data.name || 'İsimsiz Referans', 
      nullIfEmpty(data.sector),
      nullIfEmpty(data.projectSummary), 
      nullIfEmpty(data.description),
      nullIfEmpty(data.logoPath), 
      JSON.stringify(data.features || []),
      data.active ?? true, 
      data.featured || false, 
      data.sort_order || 0,
      nullIfEmpty(data.featuredImageUrl), 
      nullIfEmpty(data.beforeImageUrl), 
      nullIfEmpty(data.afterImageUrl),
      nullIfEmpty(data.city_name), 
      nullIfEmpty(data.city_slug), 
      nullIfEmpty(data.service_slug),
      data.project_size ?? null, 
      nullIfEmpty(data.project_date), 
      nullIfEmpty(data.completion_date),
      nullIfEmpty(data.project_location),
      nullIfEmpty(data.system_type),
      nullIfEmpty(data.application_type),
      nullIfEmpty(data.forklift_traffic),
      nullIfEmpty(data.concrete_type),
      data.moisture_problem ?? false,
      data.coating_thickness_mm ?? null,
      data.coverage_rate_sqm_kg ?? null,
      data.curing_time_hours ?? null,
      nullIfEmpty(data.challenge),
      nullIfEmpty(data.solution),
      nullIfEmpty(data.primary_video_url),
      data.team_visible ?? false,
    ],
  }]);
}

// ——— ROW TO DOMAIN ———
function rowToReference(row: any): Reference {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    short_description: row.short_description,
    description: row.description,
    city_name: row.city_name,
    city_slug: row.city_slug,
    service_slug: row.service_slug,
    project_location: row.project_location,
    project_size: row.project_size,
    project_date: row.project_date,
    completion_date: row.completion_date,
    system_type: row.system_type,
    application_type: row.application_type,
    forklift_traffic: row.forklift_traffic,
    concrete_type: row.concrete_type,
    moisture_problem: toBoolean(row.moisture_problem),
    coating_thickness_mm: row.coating_thickness_mm,
    coverage_rate_sqm_kg: row.coverage_rate_sqm_kg,
    curing_time_hours: row.curing_time_hours,
    challenge: row.challenge,
    solution: row.solution,
    featured_image_url: row.featured_image_url,
    before_image_url: row.before_image_url,
    after_image_url: row.after_image_url,
    logo_path: row.logo_path,
    primary_video_url: row.primary_video_url,
    sector: row.sector,
    features: parseJson(row.features),
    team_visible: toBoolean(row.team_visible),
    featured: toBoolean(row.featured),
    published: toBoolean(row.published),
    display_order: row.display_order || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToAdmin(row: any): ReferenceAdmin {
  return {
    id: String(row.id),
    name: row.title,
    slug: row.slug,
    sector: row.sector || '',
    projectSummary: row.short_description || '',
    description: row.description || '',
    logoPath: row.logo_path || '',
    features: parseJson(row.features),
    active: toBoolean(row.published),
    published: toBoolean(row.published),
    featured: toBoolean(row.featured),
    featuredImageUrl: row.featured_image_url || '',
    beforeImageUrl: row.before_image_url || '',
    afterImageUrl: row.after_image_url || '',
    sort_order: row.display_order || 0,
    city_name: row.city_name,
    city_slug: row.city_slug,
    service_slug: row.service_slug,
    project_size: row.project_size,
    project_date: row.project_date,
    completion_date: row.completion_date,
    project_location: row.project_location,
    system_type: row.system_type,
    application_type: row.application_type,
    forklift_traffic: row.forklift_traffic,
    concrete_type: row.concrete_type,
    moisture_problem: toBoolean(row.moisture_problem),
    coating_thickness_mm: row.coating_thickness_mm,
    coverage_rate_sqm_kg: row.coverage_rate_sqm_kg,
    curing_time_hours: row.curing_time_hours,
    challenge: row.challenge,
    solution: row.solution,
    primary_video_url: row.primary_video_url,
    team_visible: toBoolean(row.team_visible),
  };
}

