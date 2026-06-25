import { Service } from "@/core/types";
import { getCities as dbGetCities } from '@/modules/content/lib/locations';

export { normalizeSlug,  } from '@/modules/seo/lib/service-utils';

async function getAllServices(): Promise<Service[]> {
  const { getServices } = await import('@/lib/data');
  const data = await getServices();
  return data as Service[];
}

async function getServicesByCategory(category: string): Promise<Service[]> {
  const { getServices } = await import('@/lib/data');
  const data = await getServices();
  return (data as Service[]).filter((service) => service.category === category);
}

async function getServiceBySlug(slug: string): Promise<{ service: Service; category: string } | null> {
  const { getServiceDetail } = await import('@/lib/data');
  
  // Try by slug first
  let service = await getServiceDetail(slug);
  
  // If not found and slug looks like an ID, try by ID
  if (!service && /^\d+$/.test(slug)) {
    const { dbGet } = await import("@/core/database/db");
    service = await dbGet<any>("SELECT * FROM services WHERE id = ? LIMIT 1", [parseInt(slug)]);
    if (service) {
      try {
        service.features = typeof service.features === 'string' ? JSON.parse(service.features) : (service.features || []);
      } catch {
        service.features = [];
      }
    }
  }

  if (!service) {
    return null;
  }

  return { service, category: service.category || '' };
}

export async function getAllCities(): Promise<any[]> {
  const { getSettings, getLocations } = await import('@/lib/data');
  const settings = await getSettings();
  const pseoMode = settings?.pseo_mode ?? 'off';

  if (pseoMode === 'country_based') {
    const all = await dbGetCities();
    return all;
  }

  return getLocations();
}

/**
 * Tüm hizmet-şehir pSEO parametrelerini üretir.
 * İlçe bazlı sayfalar artık üretilmez.
 */
async function getAllServiceLocationParams(): Promise<{
  slug: string[];
}[]> {
  const { getSettings, getServices: fetchServices } = await import('@/lib/data');

  const settings = await getSettings();
  const pseoMode = settings?.pseo_mode ?? 'off';
  if (pseoMode === 'off') return [];

  const [services] = await Promise.all([
    fetchServices(),
  ]);

  const activeServices = (services as any[]).filter(s => s.active !== false);

  const targetCities = pseoMode === 'country_based'
    ? ((await dbGetCities()) as any[])
    : await getAllCities();

  const params: { slug: string[] }[] = [];

  for (const srv of activeServices) {
    for (const city of targetCities) {
      // Sadece il bazlı pSEO: /hizmetler/{service}/{city}
      params.push({ slug: [srv.slug, city.slug] });
    }
  }

  return params;
}

/**
 * Hub Template parametreleri: /hizmetler/{service}/{city}
 */
async function getAllServiceHubParams(): Promise<{ slug: string[] }[]> {
  const { getSettings, getServices: fetchServices } = await import('@/lib/data');
  const settings = await getSettings();
  const pseoMode = settings?.pseo_mode ?? 'off';
  if (pseoMode === 'off') return [];

  const services = await fetchServices() as any[];
  const activeServices = services.filter(s => s.active !== false);

  const targetCities = pseoMode === 'country_based'
    ? ((await dbGetCities()) as any[])
    : await getAllCities();

  const params: { slug: string[] }[] = [];
  for (const srv of activeServices) {
    for (const city of targetCities) {
      params.push({ slug: [srv.slug, city.slug] });
    }
  }
  return params;
}
