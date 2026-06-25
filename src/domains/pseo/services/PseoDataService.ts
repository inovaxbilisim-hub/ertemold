import 'server-only';
import { getServices } from '@/lib/data';
import { getLocationMetadata, getReferencesForCity, getReferencesForService } from '@/lib/data-pseo';
import { getCities } from '@/modules/content/lib/locations';
import { cacheService } from '@/core/cache/CacheService';
import { CACHE_TAGS } from '@/core/cache/tags';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import type { LocationMetadata, CityReference } from '@/lib/data-pseo';
import type { City } from '@/modules/content/lib/locations';
import type { PseoService } from '../types';

/**
 * PseoDataService — pSEO data erişim katmanı.
 * Tüm veri erişimi CacheService üzerinden yapılır.
 * Hook entegrasyonu ile plugin override desteklenir.
 */
export class PseoDataService {
  /**
   * Aktif servisleri getirir.
   * Hook: pseo:get-service (filter)
   */
  static async getServices() {
    return cacheService.cached(
      'pseo:services',
      async () => {
        const services = await getServices();
        return services.filter((s: { active?: boolean }) => s.active);
      },
      { tags: [CACHE_TAGS.SERVICES], ttl: 604800 },
    );
  }

  /**
   * Slug'a göre tek servis getirir.
   * Hook: pseo:get-service (filter)
   */
  static async getService(slug: string): Promise<PseoService | null> {
    const services = await PseoDataService.getServices();
    const service = services.find((candidate) => candidate.slug === slug) || null;
    if (!service) return null;
    return HookRegistry.applyFilters('pseo:get-service', service) as PseoService;
  }

  /**
   * Şehir slug'ına göre lokasyon metadata getirir.
   * Hook: pseo:get-location (filter)
   */
  static async getLocationMetadata(
    citySlug: string,
  ): Promise<LocationMetadata | null> {
    return cacheService.cached(
      `pseo:location-meta:${citySlug}`,
      async () => {
        const meta = await getLocationMetadata(citySlug);
        return HookRegistry.applyFilters('pseo:get-location', meta);
      },
      { tags: [CACHE_TAGS.LOCATIONS, CACHE_TAGS.PSEO_PAGES], ttl: 604800 },
    );
  }

  /**
   * Bir şehre ait referansları getirir.
   */
  static async getReferencesForCity(
    citySlug: string,
    limit = 3,
  ): Promise<CityReference[]> {
    return cacheService.cached(
      `pseo:refs-city:${citySlug}:${limit}`,
      async () => getReferencesForCity(citySlug, limit),
      { tags: [CACHE_TAGS.REFERENCES, CACHE_TAGS.PSEO_PAGES], ttl: 604800 },
    );
  }

  /**
   * Bir servise ait referansları getirir.
   */
  static async getReferencesForService(
    serviceSlug: string,
    limit = 6,
  ): Promise<CityReference[]> {
    return cacheService.cached(
      `pseo:refs-service:${serviceSlug}:${limit}`,
      async () => getReferencesForService(serviceSlug, limit),
      { tags: [CACHE_TAGS.REFERENCES, CACHE_TAGS.PSEO_PAGES], ttl: 604800 },
    );
  }

  /**
   * Tüm şehirleri getirir.
   */
  static async getCities(): Promise<City[]> {
    return cacheService.cached(
      'pseo:cities',
      async () => getCities(),
      { tags: [CACHE_TAGS.LOCATIONS], ttl: 86400 },
    );
  }

  /**
   * Potansiyel pSEO sayfa sayısını hesaplar.
   */
  static async getPotentialPseoCount(): Promise<number> {
    const services = await PseoDataService.getServices();
    const activeCount = services.length;
    const cities = await PseoDataService.getCities();
    const locationCount = cities.length;

    return (activeCount || 0) * locationCount;
  }
}
