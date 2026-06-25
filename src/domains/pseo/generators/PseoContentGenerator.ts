import { HookRegistry } from '@/core/hooks/HookRegistry';
import { toTurkishTitleCase } from '@/modules/seo/lib/service-utils';
import { ClimateService } from '@/domains/climate';
import { getIntroVariantIndex, renderIntroVariant, renderIntroVariantFromText } from './templates/intro-variants';
import { getProcessLine } from './templates/process-lines';
import { getBenefitLine } from './templates/benefit-lines';
import { TemplateRepository } from '../repositories/TemplateRepository';
import type { PseoParams, PseoContentContext, PseoContentResult, PseoSettings } from '../types';
import type { PseoService } from '../types';

function getPseoContentContext(
  params: PseoParams,
  settings?: PseoSettings,
): PseoContentContext {
  const { service } = params;
  const svc = service as PseoService;
  const actionVerb =
    svc.pseo_action_verb || settings?.pseo_action_verb || 'hizmet ve çözüm';
  const serviceSuffix =
    svc.pseo_service_suffix || settings?.pseo_service_suffix || 'Hizmetleri';
  const locationSuffix =
    svc.pseo_location_suffix || settings?.pseo_location_suffix || '';
  const h2Template = svc.pseo_h2_template || 'Nasıl Çalışıyoruz?';
  const combinedServiceName = svc.title;

  return {
    actionVerb,
    serviceSuffix,
    locationSuffix,
    h2Template,
    combinedServiceName,
  };
}

function buildPseoTitle(
  params: PseoParams,
  settings?: PseoSettings,
): string {
  const { location } = params;
  const context = getPseoContentContext(params, settings);
  const locationDisplayName = toTurkishTitleCase(location.name);
  const locationSegment = context.locationSuffix
    ? `${locationDisplayName} ${context.locationSuffix}`
    : locationDisplayName;

  const title = `${locationSegment} ${context.combinedServiceName} ${context.serviceSuffix}`.trim();

  // Hook: pseo:content-title (filter)
  return HookRegistry.applyFilters('pseo:content-title', title, params);
}

function buildPseoDescription(
  params: PseoParams,
  settings?: PseoSettings,
): string {
  const { service, location } = params;
  const svc = service as PseoService;
  const context = getPseoContentContext(params, settings);
  const locationDisplayName = toTurkishTitleCase(location.name);
  const locationSegment = context.locationSuffix
    ? `${locationDisplayName} ${context.locationSuffix}`
    : locationDisplayName;

  const description = `${locationSegment} bölgesinde ${svc.title.toLowerCase()} ${context.serviceSuffix.toLowerCase()} sunuyoruz. ${context.actionVerb} odaklı, hızlı keşif ve kesin sonuç garantisiyle çalışıyoruz.`.trim();

  // Hook: pseo:content-description (filter)
  return HookRegistry.applyFilters(
    'pseo:content-description',
    description,
    params,
  );
}

/**
 * PseoContentGenerator — pSEO içerik üretici.
 * Content Template sistemi ile 24 intro varyantı, 6 process, 24 benefit destekler.
 * Hook entegrasyonu ile plugin override edilebilir.
 */
export class PseoContentGenerator {
  /**
   * pSEO içerik üretir (title, description, body).
   * DB'den template çeker (TemplateRepository), DB yoksa hardcoded fallback kullanır.
   * Hook: pseo:content-intro, pseo:content-process, pseo:content-benefit (filters)
   */
  static async generate(
    params: PseoParams,
    settings?: PseoSettings,
  ): Promise<PseoContentResult> {
    const svc = params.service as PseoService;
    const { location } = params;
    const context = getPseoContentContext(params, settings);
    const locationDisplayName = toTurkishTitleCase(location.name);
    const cityDisplayName = null;

    const title = buildPseoTitle(params, settings);
    const description = buildPseoDescription(params, settings);

    const seed = `${svc.slug}|${location.citySlug}|${location.slug}`;
    const variantIndex = getIntroVariantIndex(seed);

    let intro: string;
    try {
      const dbIntro = await TemplateRepository.getContent({
        type: 'intro',
        seedIndex: variantIndex,
        serviceSlug: svc.slug,
      });
      intro = renderIntroVariantFromText(dbIntro, {
        locationDisplayName,
        cityDisplayName,
        serviceTitle: svc.title,
        labelPrefix: context.locationSuffix || '',
        locationSuffix: context.locationSuffix,
        serviceSuffix: context.serviceSuffix,
        actionVerb: context.actionVerb,
      });
    } catch {
      intro = renderIntroVariant(variantIndex, {
        locationDisplayName,
        cityDisplayName,
        serviceTitle: svc.title,
        labelPrefix: context.locationSuffix || '',
        locationSuffix: context.locationSuffix,
        serviceSuffix: context.serviceSuffix,
        actionVerb: context.actionVerb,
      });
    }

    // Hook: pseo:content-intro (filter)
    intro = HookRegistry.applyFilters('pseo:content-intro', intro, params);

    let process: string;
    try {
      process = await TemplateRepository.getContent({
        type: 'process',
        seedIndex: variantIndex,
        serviceSlug: svc.slug,
      });
    } catch {
      process = getProcessLine(variantIndex);
    }
    process = HookRegistry.applyFilters('pseo:content-process', process, params);

    let benefit: string;
    try {
      benefit = await TemplateRepository.getContent({
        type: 'benefit',
        seedIndex: variantIndex,
        serviceSlug: svc.slug,
      });
    } catch {
      benefit = getBenefitLine(variantIndex);
    }
    // Manual template variable replacement for benefit
    benefit = benefit
      .replace(/\{locationDisplayName\}/g, locationDisplayName)
      .replace(/\{cityDisplayName \|\| locationDisplayName\}/g, cityDisplayName || locationDisplayName)
      .replace(/\{cityDisplayName\|\|locationDisplayName\}/g, cityDisplayName || locationDisplayName)
      .replace(/\{cityDisplayName\}/g, cityDisplayName || '')
      .replace(/\{serviceTitle\}/g, svc.title)
      .replace(/\{actionVerb\}/g, context.actionVerb);

    benefit = HookRegistry.applyFilters('pseo:content-benefit', benefit, params);

    let processLine1: string;
    let processLine2: string;
    try {
      const contents = await TemplateRepository.getContents('process', 1, 2, svc.slug);
      processLine1 = contents[0] || getProcessLine(1);
      processLine2 = contents[1] || getProcessLine(2);
    } catch {
      processLine1 = getProcessLine(1);
      processLine2 = getProcessLine(2);
    }

    const locationIntro = `${locationDisplayName} genelinde`;

    const climate = await ClimateService.getProfileForCity(location.citySlug);

    const body = `
    <div data-geo-summary="true" class="mb-6">
      <p>${intro}</p>
    </div>
    <div class="my-6 p-5 bg-blue-50/50 border-l-4 border-blue-600 rounded-r-xl">
      <h4 class="text-blue-900 font-bold mb-2">Bölgesel Şartlara Özel Çözüm</h4>
      <p class="text-sm text-blue-800 m-0">${cityDisplayName || locationDisplayName} bölgesinin <strong>${climate.conditionDescription}</strong> dayanıklı, ${climate.recommendationSuffix}</p>
    </div>
    <h3>${context.h2Template}</h3>
    <ul>
      <li><strong>Ücretsiz Teknik Keşif:</strong> ${process}</li>
      <li><strong>Detaylı Planlama:</strong> ${processLine1}</li>
      <li><strong>Uygulama:</strong> ${processLine2}</li>
      <li><strong>Garanti ve Destek:</strong> ${context.actionVerb} odaklı çözüm sürecimizin her adımında yanınızdayız.</li>
    </ul>
    <h3>Hangi yönlerden fark sağlıyoruz?</h3>
    <ul>
      <li>${benefit}</li>
      <li>${locationIntro} alanındaki işlerinizde daha doğru maliyet ve zamanlama sunuyoruz.</li>
      <li>Kalite kontrol, malzeme seçimi ve uygulama standardımız üst düzeydedir.</li>
      <li>${context.serviceSuffix} süreçlerinde hızlı keşif ve profesyonel destek sağlıyoruz.</li>
    </ul>
  `;

    return { title, description, body };
  }
}
