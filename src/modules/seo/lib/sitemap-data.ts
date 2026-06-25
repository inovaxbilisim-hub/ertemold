import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { getServices, getServiceCategories } from '@/modules/content/lib/data-services';
import { getCities } from '@/modules/content/lib/locations';
import { getAllPages } from '@/modules/content/lib/data-pages';
import { getReferences } from '@/modules/content/lib/data-services';
import { CACHE_TAGS } from '@/core/cache/tags';

export const getSitemapData = cache(unstable_cache(
  async () => {
    const [services, cities, pages, references, categories] = await Promise.all([
      getServices(),
      getCities(),
      getAllPages(),
      getReferences().catch(() => []),
      getServiceCategories(),
    ]);
    return { services, cities, pages, references, categories };
  },
  ['sitemap-data'],
  { revalidate: 86400, tags: [CACHE_TAGS.SITEMAP_DATA] }
));
