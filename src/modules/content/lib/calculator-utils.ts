import type {
  CalculatorPlacement,
  CalculatorPageType,
  ThicknessPrice,
  ExtraService,
  ServiceCalculatorConfig,
} from '@/core/types';
import type { LocationMetadata } from '@/lib/data-pseo';

export function normalizePlacement(value: unknown): CalculatorPlacement {
  const placement = String(value || 'service_only').trim().toLowerCase();
  const validPlacements = ['all', 'service_only', 'location_only', 'calculator_page_only', 'cta_only', 'none'] as const;
  return validPlacements.includes(placement as any)
    ? (placement as CalculatorPlacement)
    : 'service_only';
}

export function isCalculatorPlacementAllowed(
  pageType: CalculatorPageType,
  placement: CalculatorPlacement,
): boolean {
  if (placement === 'none') return false;
  if (placement === 'cta_only') return false; // CTA mode: calculator never shown inline
  if (placement === 'all') return true;
  if (placement === 'calculator_page_only') return pageType === 'calculator-page';
  if (placement === 'service_only') return pageType === 'service' || pageType === 'calculator-page';
  if (placement === 'location_only') return pageType === 'pseo' || pageType === 'calculator-page';
  return false;
}

function shouldShowCalculatorCTA(
  pageType: CalculatorPageType,
  placement: CalculatorPlacement,
): boolean {
  // Show CTA button when calculator is not shown inline
  if (placement === 'cta_only') return true;
  if (placement === 'none') return false;
  if (placement === 'service_only' && pageType === 'pseo') return true; // Show CTA on location pages
  if (placement === 'location_only' && pageType === 'service') return true; // Show CTA on service pages
  if (placement === 'calculator_page_only') return pageType !== 'calculator-page'; // Show CTA everywhere except calculator page
  return false;
}

export function parseOsbList(metadata?: LocationMetadata | null): string[] {
  if (!metadata?.osb_list) return [];
  try {
    const parsed = JSON.parse(metadata.osb_list);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(metadata.osb_list)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export function parseIndustryProfile(metadata?: LocationMetadata | null): unknown {
  if (!metadata?.industry_profile) return null;
  try {
    const parsed = JSON.parse(metadata.industry_profile);
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return String(metadata.industry_profile).trim() || null;
  }
}

function parsePriceItem(item: unknown): ThicknessPrice {
  const obj = item as Record<string, unknown> | null;
  const rawStr = String(obj?.value ?? 0).replace(',', '.').replace(/[^\d.-]/g, '');
  const numericValue = parseFloat(rawStr);
  return {
    label: String(obj?.label || '').trim(),
    price: isNaN(numericValue) ? 0 : numericValue,
  };
}

function parseExtraService(item: unknown): ExtraService {
  const obj = item as Record<string, unknown> | null;
  const rawStr = String(obj?.value ?? 0).replace(',', '.').replace(/[^\d.-]/g, '');
  const numericValue = parseFloat(rawStr);
  return {
    label: String(obj?.label || '').trim(),
    price: isNaN(numericValue) ? 0 : numericValue,
  };
}

export function parseServiceConfigs(raw: unknown[]): ServiceCalculatorConfig[] {
  return raw
    .map((item: unknown) => {
      const obj = item as Record<string, unknown> | null;
      const serviceSlug = String(obj?.service_slug || '').trim();
      if (!serviceSlug) return null;

      return {
        service_slug: serviceSlug,
        title: String(obj?.title || '').trim(),
        thickness_prices: (Array.isArray(obj?.thickness_prices) ? obj.thickness_prices : [])
          .map(parsePriceItem)
          .filter((p) => p.label.length > 0),
        extra_services: (Array.isArray(obj?.extra_services) ? obj.extra_services : [])
          .map(parseExtraService)
          .filter((e) => e.label.length > 0),
      };
    })
    .filter((c): c is ServiceCalculatorConfig => c !== null);
}

export function formatCurrencyValue(value: number, currency: string): string {
  if (currency === 'TL') return `${value.toLocaleString('tr-TR')} TL`;
  if (currency === 'USD') return `${value.toLocaleString('en-US')} $`;
  return `${value.toLocaleString('tr-TR')} €`;
}

export function getCurrencyLabel(currency: string): string {
  if (currency === 'TL') return 'TL';
  if (currency === 'USD') return '$';
  return '€';
}

export function buildClimateText(
  metadata?: LocationMetadata | null,
): string {
  if (!metadata) return '';
  
  let nemGrubu: string = metadata.humidity_group;
  if (nemGrubu === 'HIGH') nemGrubu = 'Yüksek';
  if (nemGrubu === 'MED') nemGrubu = 'Orta';
  if (nemGrubu === 'LOW') nemGrubu = 'Düşük';

  return `Bu şehirde en yüksek yaz sıcaklığı ${metadata.max_temp_summer_c}°C, en düşük kış sıcaklığı ${metadata.min_temp_winter_c}°C ve nem grubu ${nemGrubu}.`;
}
