import { HookRegistry } from '@/core/hooks/HookRegistry';
import { AiOverviewsHelper } from '@/domains/seo-engine/aeo/AiOverviewsHelper';
import type { AeoSummaryBlockProps } from '@/modules/content/sections/AeoSummaryBlock';

type SummaryContext = {
  pageType?: 'service_detail' | 'pseo_location' | 'reference_detail' | string;
  settings?: any;
  service?: any;
  category?: any;
  reference?: any;
  faqs?: any[];
  cityReferences?: any[];
  cityStats?: any;
  cityName?: string;
};

function compactList(values: unknown[], limit = 3): string[] {
  return values
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .slice(0, limit);
}

function buildServiceSummary(context: SummaryContext): AeoSummaryBlockProps | null {
  const { service, category, faqs } = context;
  if (!service) return null;

  const features = compactList(service.features || []);
  const summary = AiOverviewsHelper.buildAeoSummaryBlock({
    title: service.title || 'Hizmet özeti',
    description:
      service.seoDescription ||
      service.longDescription ||
      service.description ||
      '',
    features,
    query: service.title,
  });

  return {
    eyebrow: 'AEO Özeti',
    title: service.title || 'Hizmet özeti',
    summary,
    items: [
      {
        label: 'Kategori',
        value: category?.name || service.category || 'Kurumsal hizmet',
      },
      {
        label: 'Öne Çıkan',
        value: features.length > 0 ? features.join(', ') : 'Kısa ve net hizmet özeti',
      },
      {
        label: 'SSS',
        value: `${Array.isArray(faqs) ? faqs.length : 0} soru`,
      },
    ],
    note: 'Arama ve AI özetleri için optimize edildi',
  };
}

function buildLocationSummary(context: SummaryContext): AeoSummaryBlockProps | null {
  const { service, cityName, cityStats, cityReferences, faqs } = context;
  if (!service || !cityName) return null;

  const summary = AiOverviewsHelper.buildAeoSummaryBlock({
    title: `${cityName} ${service.title}`,
    description:
      service.seoDescription ||
      service.longDescription ||
      service.description ||
      '',
    features: compactList(service.features || []),
    query: `${cityName} ${service.title}`,
  });

  const referenceCount = Array.isArray(cityReferences) ? cityReferences.length : 0;
  const statLabel = cityStats?.score
    ? `Skor ${cityStats.score}`
    : cityStats?.title || 'Yerel veri';

  return {
    eyebrow: 'Yerel AEO',
    title: `${cityName} ${service.title}`,
    summary,
    items: [
      {
        label: 'Şehir',
        value: cityName,
      },
      {
        label: 'Referans',
        value: `${referenceCount} kayıt`,
      },
      {
        label: 'Yerel sinyal',
        value: statLabel,
      },
    ],
    note: Array.isArray(faqs) && faqs.length > 0 ? `${faqs.length} yerel SSS ile destekleniyor` : 'Yerel arama niyeti için optimize edildi',
  };
}

function buildReferenceSummary(context: SummaryContext): AeoSummaryBlockProps | null {
  const { reference, service } = context;
  if (!reference) return null;

  const summary = AiOverviewsHelper.buildAeoSummaryBlock({
    title: reference.name || 'Referans özeti',
    description:
      reference.projectSummary ||
      reference.description ||
      reference.solution ||
      reference.challenge ||
      '',
    features: compactList(reference.features || []),
    query: reference.name,
  });

  return {
    eyebrow: 'Proje Özeti',
    title: reference.name || 'Referans özeti',
    summary,
    items: [
      {
        label: 'Hizmet',
        value: service?.title || 'Belirtilmemiş',
      },
      {
        label: 'Sektör',
        value: reference.sector || 'Genel',
      },
      {
        label: 'Lokasyon',
        value: reference.city_name || 'Belirtilmemiş',
      },
    ],
    note: reference.challenge && reference.solution ? 'Sorun ve çözüm odaklı referans özeti' : 'Referans verisine dayalı kısa özet',
  };
}

export function initPlugin() {
  HookRegistry.addFilter('aeo_summary_block', (value: AeoSummaryBlockProps | null, context: SummaryContext) => {
    if (value) return value;

    switch (context.pageType) {
      case 'service_detail':
        return buildServiceSummary(context);
      case 'pseo_location':
        return buildLocationSummary(context);
      case 'reference_detail':
        return buildReferenceSummary(context);
      default:
        return value;
    }
  }, 10);
}
