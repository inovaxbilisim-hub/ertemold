// Simple LRU cache wrapper using lru-cache
import LRUCache from 'lru-cache';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Creates an LRU style cache with optional TTL.
 * @param maxSize Maximum number of entries.
 * @param ttlMs Time‑to‑live in milliseconds.
 */
export function createCache<T>(maxSize = 100, ttlMs = 5 * 60 * 1000) {
  const cache = new LRUCache<string, T>({
    max: maxSize,
    ttl: ttlMs,
  });

  return {
    get(key: string) {
      return cache.get(key) as T | undefined;
    },
    set(key: string, value: T) {
      cache.set(key, value);
    },
    clear() {
      cache.clear();
    },
  };
}
