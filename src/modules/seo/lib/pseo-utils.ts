interface PseoLocation {
  name: string;
  slug: string;
  citySlug: string;
  cityName: string;
}

export interface PseoParams {
  service: any;
  location: PseoLocation;
  isM2PricePage?: boolean;
  /** Hub mode: sadece şehir bazlı pSEO — Hub Template gösterilecek */
  isHubMode?: boolean;
}

/**
 * Desteklenen pSEO URL yapısı:
 *
 * Format 1: [service, city]                    ← İL BAZLI pSEO
 *   → /hizmetler/epoksi-zemin/istanbul
 *
 * Format 2: [service, m2-fiyat-al]             ← m² fiyat teklifi sayfası
 *   → /hizmetler/epoksi-zemin/m2-fiyat-al
 */
import { createCache } from '@/lib/cache';
import type { City } from '@/modules/content/lib/locations';
import type { Service } from '@/core/types/content';
import { getServices } from '@/lib/data';
import { getCities } from '@/modules/content/lib/locations';
import { normalizeSlug, toTurkishTitleCase } from '@/modules/seo/lib/service-utils';
import type { LocationMetadata } from '@/lib/data-pseo';

export const M2_PRICE_PAGE_SLUG = 'm2-fiyat-al';

function isM2PricePageSlug(slug: string) {
  return slug === M2_PRICE_PAGE_SLUG;
}

function getM2PriceLocation(serviceSlug: string) {
  return {
    name: 'Türkiye',
    slug: serviceSlug,
    citySlug: '',
    cityName: 'Türkiye',
  };
}

function getCityLocation(candidateSlug: string, cities: City[]) {
  const city = cities.find(c => c.slug === candidateSlug || normalizeSlug(c.name) === candidateSlug);
  if (!city) return null;

  return {
    name: city.name,
    slug: candidateSlug,
    citySlug: candidateSlug,
    cityName: city.name,
  };
}

const servicesCache = createCache<Service[]>();
const citiesCache = createCache<City[]>();

async function getServicesCached(): Promise<Service[]> {
  const key = 'services';
  let cached = servicesCache.get(key);
  if (!cached) {
    const services = await getServices();
    servicesCache.set(key, services);
    cached = services;
  }
  return cached;
}

async function getCitiesCached(): Promise<City[]> {
  const key = 'cities';
  let cached = citiesCache.get(key);
  if (!cached) {
    const cities = await getCities();
    citiesCache.set(key, cities);
    cached = cities;
  }
  return cached;
}

export async function resolvePseoParams(slugs: string[], settings?: any): Promise<PseoParams | null> {
  if (slugs.length !== 2) return null;

  const [serviceSlug, candidateSlug] = slugs;

  const services = await getServicesCached();
  const service = services.find(s => s.slug === serviceSlug && s.active);
  if (!service) return null;

  const cities = await getCitiesCached();
  const seoConfig = settings?.plugin_configs?.['service-calculator'] || {};
  const isM2PriceEnabled = seoConfig.seo_enable_m2_price_page !== false;

  if (isM2PricePageSlug(candidateSlug)) {
    if (!isM2PriceEnabled) return null;
    return {
      service,
      location: getM2PriceLocation(serviceSlug),
      isHubMode: false,
      isM2PricePage: true,
    };
  }

  const cityLocation = getCityLocation(candidateSlug, cities);
  if (!cityLocation) return null;

  return {
    service,
    location: cityLocation,
    isHubMode: false,
  };
}

function replacePlaceholders(template: string, context: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(context[key] ?? ''));
}

function getPseoContentContext(params: PseoParams, settings?: any): any {
  const { service, isM2PricePage } = params;
  const actionVerb = service.pseo_action_verb || settings?.pseo_action_verb || 'hizmet ve çözüm';
  const serviceSuffix = service.pseo_service_suffix || settings?.pseo_service_suffix || 'Hizmetleri';
  const locationSuffix = service.pseo_location_suffix || settings?.pseo_location_suffix || '';
  const h2Template = service.pseo_h2_template || 'Nasıl Çalışıyoruz?';
  const combinedServiceName = service.title;

  return {
    actionVerb,
    serviceSuffix,
    locationSuffix,
    h2Template,
    combinedServiceName,
    isM2PricePage: Boolean(isM2PricePage),
  };
}

function buildPseoTitle(params: PseoParams, settings?: any, metadata?: LocationMetadata | null) {
  const { service, location } = params;
  if (metadata?.seo_title) {
    return metadata.seo_title;
  }

  const { locationSuffix, combinedServiceName } = getPseoContentContext(params, settings);
  const seoConfig = settings?.plugin_configs?.['service-calculator'] || {};
  const rawTemplate = seoConfig.seo_page_title_template || `{city} ${combinedServiceName} için m² fiyat teklifi`;
  const locationDisplayName = toTurkishTitleCase(metadata?.city_name || location.name);
  const locationSegment = locationSuffix ? `${locationDisplayName} ${locationSuffix}` : locationDisplayName;

  return replacePlaceholders(rawTemplate, {
    service: combinedServiceName,
    city: locationSegment,
    category: service.category_name || service.category || '',
    currency: seoConfig.currency || 'EUR',
  }).trim();
}

function buildPseoDescription(params: PseoParams, settings?: any, metadata?: LocationMetadata | null) {
  const { service, location } = params;
  if (metadata?.seo_description) {
    return metadata.seo_description;
  }

  const { locationSuffix } = getPseoContentContext(params, settings);
  const seoConfig = settings?.plugin_configs?.['service-calculator'] || {};
  const rawTemplate = seoConfig.seo_page_description_template || `{city} bölgesinde ${service.title.toLowerCase()} m² fiyat teklifini alın. Hızlı keşif ve detaylı teklif.`;
  const locationDisplayName = toTurkishTitleCase(metadata?.city_name || location.name);
  const locationSegment = locationSuffix ? `${locationDisplayName} ${locationSuffix}` : locationDisplayName;

  return replacePlaceholders(rawTemplate, {
    service: service.title,
    city: locationSegment,
    category: service.category_name || service.category || '',
    currency: seoConfig.currency || 'EUR',
  }).trim();
}

function parseOsbList(osbList: any): string[] {
  if (!osbList) return [];
  if (Array.isArray(osbList)) return osbList;

  try {
    return JSON.parse(String(osbList));
  } catch {
    return [];
  }
}

export function generatePseoContent(params: PseoParams, settings?: any, metadata?: LocationMetadata | null) {
  const { service, location, isM2PricePage } = params;
  const { h2Template, locationSuffix } = getPseoContentContext(params, settings);
  const seoConfig = settings?.plugin_configs?.['service-calculator'] || {};
  const locationDisplayName = toTurkishTitleCase(metadata?.city_name || location.name);
  const locationSegment = locationSuffix ? `${locationDisplayName} ${locationSuffix}` : locationDisplayName;
  const title = buildPseoTitle(params, settings, metadata);
  const description = buildPseoDescription(params, settings, metadata);
  const rawBodyTemplate = seoConfig.seo_page_body_template || `<p>${locationSegment} bölgesinde ${service.title.toLowerCase()} m² fiyat teklifini hemen alın. Teknik keşif, hızlı dönüş ve profesyonel uygulama.</p>`;

  const body = replacePlaceholders(rawBodyTemplate, {
    service: service.title,
    city: locationSegment,
    category: service.category_name || service.category || '',
    currency: seoConfig.currency || 'EUR',
  });

  const statsSummary = metadata
    ? `<p>${locationSegment} için en yüksek yaz sıcaklığı ${metadata.max_temp_summer_c}°C, en düşük kış sıcaklığı ${metadata.min_temp_winter_c}°C ve ${metadata.humidity_group === 'HIGH' ? 'yüksek' : metadata.humidity_group === 'LOW' ? 'düşük' : 'orta'} nem grubu koşullarına göre projelendiriyoruz.</p>`
    : '';

  const osbSummary = metadata && metadata.osb_list
    ? (() => {
        const osbs = parseOsbList(metadata.osb_list);
        return osbs.length > 0 ? `<p>${locationDisplayName} çevresindeki ${osbs.slice(0, 3).join(', ')} gibi ana sanayi bölgelerine hızlı sevkiyat ve saha desteği sağlıyoruz.</p>` : '';
      })()
    : '';

  const extraParagraph = isM2PricePage
    ? `<p>m² fiyat teklifi sayfası olarak, sahadan keşif sonrası kesin maliyet ve uygulama sürecini size hızlıca iletmeyi hedefliyoruz.</p>`
    : `<p>${locationSegment} için sunduğumuz keşif ve teklif süreçleri, projenizin ihtiyaçlarına göre özelleştiriliyor.</p>`;

  const renderedBody = `${body}
    ${statsSummary}
    ${osbSummary}
    <div class="mb-6">
      <h2>${h2Template}</h2>
      <p>${extraParagraph}</p>
    </div>`;

  return { title, description, body: renderedBody };
}

/**
 * Toplam potansiyel pSEO sayfa sayısını döndürür (sadece iller).
 */
export async function getPotentialPseoCount(settings?: any) {
  const services = await getServices();
  const activeServices = services.filter(s => s.active);
  const cities = await getCities();
  const locationCount = cities.length;
  const seoConfig = settings?.plugin_configs?.['service-calculator'] || {};
  const m2PagesEnabled = seoConfig.seo_enable_m2_price_page !== false;

  const cityPseoCount = (activeServices.length || 0) * locationCount;
  const m2PricePageCount = m2PagesEnabled ? activeServices.length : 0;

  return cityPseoCount + m2PricePageCount;
}
