import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Shared cache across all mock unstable_cache calls
const sharedCache = new Map<string, unknown>();

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown, keyParts: string[]) => {
    const cacheKey = keyParts.join('::');
    return async () => {
      if (sharedCache.has(cacheKey)) return sharedCache.get(cacheKey);
      const result = await fn();
      sharedCache.set(cacheKey, result);
      return result;
    };
  },
  revalidateTag: vi.fn(),
}));

beforeEach(() => {
  sharedCache.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  sharedCache.clear();
});

describe('CacheService', () => {
  it('should return cached value on second call', async () => {
    const { cacheService } = await import('./CacheService');

    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return 'value1';
    };

    const result1 = await cacheService.cached('test-key', fetcher, { tags: ['test'] });
    const result2 = await cacheService.cached('test-key', fetcher, { tags: ['test'] });

    expect(result1).toBe('value1');
    expect(result2).toBe('value1');
    expect(callCount).toBe(1);
  });

  it('should call fetcher on cache miss', async () => {
    const { cacheService } = await import('./CacheService');

    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { data: 'fresh' };
    };

    const result = await cacheService.cached('new-key', fetcher, { tags: ['new'] });
    expect(result.data).toBe('fresh');
    expect(callCount).toBe(1);
  });

  it('should revalidate by tag', async () => {
    const { cacheService } = await import('./CacheService');

    const { revalidateTag } = await import('next/cache');

    cacheService.revalidateByTag('my-tag');
    expect(revalidateTag).toHaveBeenCalledWith('my-tag', 'default');
  });

  it('should support sequential access', async () => {
    const { cacheService } = await import('./CacheService');

    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return 'cached-value';
    };

    const result1 = await cacheService.cached('seq-key', fetcher, { tags: ['s'] });
    const result2 = await cacheService.cached('seq-key', fetcher, { tags: ['s'] });
    const result3 = await cacheService.cached('seq-key', fetcher, { tags: ['s'] });

    expect(result1).toBe('cached-value');
    expect(result2).toBe('cached-value');
    expect(result3).toBe('cached-value');
    expect(callCount).toBe(1);
  });

  it('should revalidate multiple tags', async () => {
    const { cacheService } = await import('./CacheService');

    const { revalidateTag } = await import('next/cache');

    cacheService.revalidateByTags(['tag1', 'tag2', 'tag3']);
    expect(revalidateTag).toHaveBeenCalledTimes(3);
    expect(revalidateTag).toHaveBeenCalledWith('tag1', 'default');
    expect(revalidateTag).toHaveBeenCalledWith('tag2', 'default');
    expect(revalidateTag).toHaveBeenCalledWith('tag3', 'default');
  });
});
