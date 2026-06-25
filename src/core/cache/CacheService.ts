/**
 * CacheService — Merkezi cache katmanı.
 * Next.js unstable_cache üzerine inşa edilmiş, tag-based invalidation ve hook entegrasyonu sağlar.
 */
import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { CACHE_TAGS } from './tags';

export type CacheOptions = {
  tags?: string[];
  ttl?: number;
};

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

class CacheService {
  private static DEFAULT_TTL = 604800; // 1 week in seconds

  /**
   * Cache alır veya oluşturur. Eğer cache'de yoksa fetcher çağrılır.
   * Hook'lar: cache:before-get (action), cache:after-set (action)
   */
  async cached<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    const { tags = [], ttl = CacheService.DEFAULT_TTL } = options;

    // Hook: cache:before-get
    HookRegistry.doAction('cache:before-get', key);

    const cacheFn = unstable_cache(
      async () => {
        const data = await fetcher();
        return { data, expiresAt: Date.now() + ttl * 1000 } as CacheEntry<T>;
      },
      [key],
      {
        tags: [...tags, CACHE_TAGS.PSEO_PAGES],
        revalidate: ttl,
      },
    );

    const entry = await cacheFn();

    // Hook: cache:after-set (only fires on actual fetch, not cache hit)
    HookRegistry.doAction('cache:after-set', key, entry.data);

    return entry.data;
  }

  /**
   * Salt okunur cache erişimi.
   *
   * Not: unstable_cache bu şekilde "salt-read" desteği vermez; bu metodun gerçek implementasyonu
   * için ayrı bir LRU/Memory cache katmanı eklenmelidir.
   */
  async getCached<T>(
    _key: string,
    _options: CacheOptions = {},
  ): Promise<T | null> {
    throw new Error(
      'cacheService.getCached is not implemented. Use cacheService.cached(...) instead.',
    );
  }

  /**
   * Tek bir tag ile cache invalidation.
   */
  revalidateByTag(tag: string): void {
    revalidateTag(tag, 'default');
  }

  /**
   * Birden çok tag ile toplu cache invalidation.
   */
  revalidateByTags(tags: string[]): void {
    tags.forEach((t) => revalidateTag(t, 'default'));
  }
}

const CACHE_SERVICE_KEY = '__ERTEM_CACHE_SERVICE__' as const;
const globalAny = globalThis as Record<string, unknown>;

if (!globalAny[CACHE_SERVICE_KEY]) {
  globalAny[CACHE_SERVICE_KEY] = new CacheService();
}

export const cacheService = globalAny[CACHE_SERVICE_KEY] as CacheService;
