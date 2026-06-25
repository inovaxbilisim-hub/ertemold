import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { dbAll, dbGet } from '@/core/database/db';

export const getPage = cache(async (slugOrId: string): Promise<Record<string, unknown> | null> => {
  const isNumeric = /^\d+$/.test(slugOrId);
  const row = isNumeric
    ? await dbGet<Record<string, unknown>>('SELECT * FROM pages WHERE id = $1', [Number(slugOrId)])
    : await dbGet<Record<string, unknown>>('SELECT * FROM pages WHERE slug = $1 AND is_published = true', [slugOrId]);
  return row ?? null;
});

export const getAllPages = cache(unstable_cache(async (): Promise<any[]> => {
  return dbAll<Record<string, unknown>>(
    'SELECT * FROM pages WHERE is_published = true ORDER BY title ASC'
  );
}, ['v3-all-pages'], { tags: ['pages'], revalidate: 604800 }));
