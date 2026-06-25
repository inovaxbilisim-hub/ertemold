import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { dbAll } from '@/core/database/db';

export interface City {
  id: number;
  name: string;
  slug: string;
  plate_code: string | null;
}

export const getCities = cache(unstable_cache(
  async (): Promise<City[]> => {
    const rows = await dbAll<Record<string, unknown>>(
      `SELECT id, name, slug, plate_code FROM cities WHERE active = TRUE ORDER BY plate_code::int ASC`
    );
    return rows.map(r => ({
      id: Number(r.id),
      name: String(r.name),
      slug: String(r.slug),
      plate_code: r.plate_code ? String(r.plate_code) : null
    }));
  },
  ['cities-list'],
  { revalidate: 86400, tags: ['locations'] }
));

const getCityBySlug = cache(unstable_cache(
  async (slug: string): Promise<City | null> => {
    const rows = await dbAll<Record<string, unknown>>(
      `SELECT id, name, slug, plate_code FROM cities WHERE slug = $1 AND active = TRUE LIMIT 1`,
      [slug]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: Number(r.id),
      name: String(r.name),
      slug: String(r.slug),
      plate_code: r.plate_code ? String(r.plate_code) : null
    };
  },
  ['city-by-slug'],
  { revalidate: 86400, tags: ['locations'] }
));
