import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { dbAll, dbGet } from '@/core/database/db';

const getPage = cache(async (slugOrId: string): Promise<Record<string, unknown> | null> => {
  return unstable_cache(async () => {
    const numId = Number(slugOrId);
    const row = await dbGet<Record<string, unknown>>(
      numId > 0
        ? "SELECT * FROM pages WHERE id = $1 AND is_published = true LIMIT 1"
        : "SELECT * FROM pages WHERE slug = $1 AND is_published = true LIMIT 1",
      [numId > 0 ? numId : slugOrId]
    );
    return row;
  }, ['v2-page', slugOrId], { tags: ['pages'], revalidate: 604800 })();
});

export const getAllPages = cache(unstable_cache(async (): Promise<any[]> => {
  const rows = await dbAll<Record<string, unknown>>(
    'SELECT * FROM pages WHERE is_published = true'
  );
  return rows;
}, ['v2-all-pages'], { tags: ['pages'], revalidate: 604800 }));
