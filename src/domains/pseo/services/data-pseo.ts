import 'server-only';
import { dbGet, dbAll } from '@/core/database/db';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

export interface LocationMetadata {
  city_slug: string;
  city_name: string;
  humidity_group: 'HIGH' | 'MED' | 'LOW';
  max_temp_summer_c: number;
  min_temp_winter_c: number;
  osb_list: string;
  industry_profile: string;
  seo_title: string;
  seo_description: string;
  is_active: boolean;
}

export interface CityReference {
  id: number;
  slug: string;
  title: string;
  short_description: string | null;
  city_name: string | null;
  city_slug: string | null;
  service_slug: string | null;
  project_size: number | null;
  project_date: string | null;
  featured_image_url: string | null;
  logo_path: string | null;
  sector: string | null;
  featured: boolean;
  system_type: string | null;
  application_type: string | null;
  concrete_type: string | null;
  coating_thickness_mm: number | null;
  coverage_rate_sqm_kg: number | null;
  curing_time_hours: number | null;
  challenge: string | null;
  solution: string | null;
  primary_video_url: string | null;
}

export const getLocationMetadata = cache(
  unstable_cache(
    async (citySlug: string): Promise<LocationMetadata | null> => {
      return dbGet<LocationMetadata>(
        'SELECT * FROM location_metadata WHERE city_slug = $1',
        [citySlug]
      );
    },
    ['v1-location-metadata'],
    { tags: ['locations'], revalidate: 604800 }
  )
);

export const getReferencesForCity = cache(
  unstable_cache(
    async (citySlug: string, limit = 3): Promise<CityReference[]> => {
      return dbAll<CityReference>(
        `SELECT id, slug, title, short_description, city_name, city_slug,
                service_slug, project_size, project_date, featured_image_url,
                logo_path, sector, featured, system_type, application_type, 
                concrete_type, coating_thickness_mm, coverage_rate_sqm_kg, 
                curing_time_hours, challenge, solution, primary_video_url
         FROM "references"
         WHERE city_slug = $1 AND published = true
         ORDER BY featured DESC, display_order ASC, created_at DESC
         LIMIT $2`,
        [citySlug, limit]
      );
    },
    ['v1-references-for-city'],
    { tags: ['references'], revalidate: 604800 }
  )
);

export const getReferencesForService = cache(
  unstable_cache(
    async (serviceSlug: string, limit = 6): Promise<CityReference[]> => {
      return dbAll<CityReference>(
        `SELECT id, slug, title, short_description, city_name, city_slug,
                service_slug, project_size, project_date, featured_image_url,
                logo_path, sector, featured, system_type, application_type, 
                concrete_type, coating_thickness_mm, coverage_rate_sqm_kg, 
                curing_time_hours, challenge, solution, primary_video_url
         FROM "references"
         WHERE service_slug = $1 AND published = true
         ORDER BY featured DESC, display_order ASC, created_at DESC
         LIMIT $2`,
        [serviceSlug, limit]
      );
    },
    ['v1-references-for-service'],
    { tags: ['references'], revalidate: 604800 }
  )
);
