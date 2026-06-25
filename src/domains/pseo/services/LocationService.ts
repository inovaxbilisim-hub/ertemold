import { normalizeSlug } from '@/modules/seo/lib/service-utils';
import { getCities } from '@/modules/content/lib/locations';
import type { PseoLocation } from '../types';

/**
 * LocationService — pSEO lokasyon çözümleme.
 * İlçeler kaldırıldı, yalnızca şehir düzeyi formatlar desteklenir.
 */
export class LocationService {
  /**
   * normalizeSlug delegasyonu — merkezi slug normalizasyonu.
   */
  static normalize(input: string): string {
    return normalizeSlug(input);
  }

  /**
   * Bir şehir ismini normalleştirilmiş slug ile bulur.
   */
  static async findCity(
    candidate: string,
  ): Promise<{ name: string; slug: string } | null> {
    const cities = await getCities();
    const city =
      cities.find(
        (c) => c.slug === candidate || normalizeSlug(c.name) === candidate,
      ) || null;
    if (!city) return null;
    return { name: city.name, slug: city.slug };
  }

  static async resolveFromSlugs(
    slugs: string[],
  ): Promise<PseoLocation | null> {
    if (slugs.length < 2 || slugs.length > 3) return null;

    const citySlug = slugs.length === 2 ? slugs[1] : slugs[2];
    const city = await LocationService.findCity(citySlug);
    if (!city) return null;
      return {
        name: city.name,
        slug: citySlug,
        citySlug,
        cityName: city.name,
      };
  }
}
