import Link from 'next/link';
import CloudinaryImage from '@/shared/components/CloudinaryImage';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import Breadcrumbs from '@/shared/layout/Breadcrumbs';
import StructuredData from '@/modules/seo/components/StructuredData';
import PhoneLink from '@/shared/layout/PhoneLink';
import ServiceCalculatorBlock from '@/modules/content/components/ServiceCalculatorBlock';
import CalculatorCTAButton from '@/modules/content/components/CalculatorCTAButton';
import { formatUiText } from '@/modules/settings/lib/ui-content';
import { normalizeSlug } from '@/modules/content/lib/services';
import { getServices, getSectors } from '@/lib/data';

import ServiceAreasSection from '@/modules/content/sections/ServiceAreasSection';
import FaqSection from '@/modules/content/sections/FaqSection';
import CityReferencesSection from '@/modules/content/sections/CityReferencesSection';
import CityReferenceHighlights from '@/modules/content/sections/CityReferenceHighlights';
import { CityIndustryProfile } from '@/modules/content/components/CityIndustryProfile';
import CityCaseStudyBlock from '@/modules/content/components/CityCaseStudyBlock';
import { getSiteUrl } from '@/core/utils/host';
import BlockRenderer from './BlockRenderer';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { CONTENT_INJECT_SECTION, CONTENT_BEFORE_RENDER } from '@/core/hooks/hooks';
import { AiOverviewsHelper } from '@/domains/seo-engine/aeo/AiOverviewsHelper';

import { Branch, Service, SiteSettings, FAQ, Stat } from '@/core/types';
import type { CityReference, LocationMetadata } from '@/lib/data-pseo';

interface ServiceLocationTemplateProps {
  service: Service | any;
  cityName: string;
  citySlug?: string;
  locSlug: string;
  cities: any[];
  settings: SiteSettings | null | any;
  branchInfo?: Branch | any;
  customContent?: string;
  heroDescription?: string;
  faqs?: FAQ[] | any[];
  stats?: Stat[] | any[];
  locationSchema?: any;
  blocks?: any[];
  locationName?: string;
  serviceName?: string;
  cityReferences?: CityReference[];
  cityStats?: any;
  metadata?: LocationMetadata | null;
  cityIndustryProfile?: any;
  cityCaseStudies?: any[];
  templateVariation?: {
    heroBadge: string;
    heroTitle: string;
    heroDescription: string;
    primaryCta: string;
    secondaryCta: string;
    contentBadge: string;
    keyBenefit: string;
  };
}

export default async function ServiceLocationTemplate({
  service,
  cityName,
  citySlug,
  locSlug: _locSlug,
  cities,
  settings,
  branchInfo,
  customContent,
  heroDescription,
  faqs,
  stats: _stats,
  locationSchema,
  blocks,
  locationName,
  serviceName,
  cityReferences,
  cityStats,
  metadata,
  cityIndustryProfile,
  cityCaseStudies,
  templateVariation,
}: ServiceLocationTemplateProps) {
  HookRegistry.doAction(CONTENT_BEFORE_RENDER, { template: 'ServiceLocationTemplate', service, cityName, settings });

  const injectedSections = await HookRegistry.applyFiltersAsync(CONTENT_INJECT_SECTION, {
    hero: { title: service.seo?.h1 || service.title, description: service.seo?.seoDescription || '' },
    content: { customContent },
    features: service.features,
    calculator: null,
  }, { service, cityName, settings, template: 'ServiceLocationTemplate' });

  const heroSection = injectedSections.hero || { title: service.seo?.h1 || service.title, description: service.seo?.seoDescription || '' };
  const calculatorSection = injectedSections.calculator as { 
    enabled?: boolean; 
    showCTA?: boolean; 
    ctaButtonText?: string; 
    ctaButtonIcon?: 'Calculator' | 'ArrowRight' | 'DollarSign' | 'none';
  } | null;

  const allServices = await getServices();
  const otherServices = allServices.filter(s => s.slug !== service.slug);
  
  const sectorsData = await getSectors();
  const compatibleSlugs = service.compatible_sectors || [];
  const activeCompatibleSectors = sectorsData.filter(sec => 
    sec.active && compatibleSlugs.includes(sec.slug)
  );

  const serviceLocationUi = settings?.uiContent?.serviceLocation || {};
  const visibility = settings?.sectionVisibility?.serviceLocation || {};
  const localPhone = branchInfo?.phone || settings?.phone || '';
  const siteUrl = await getSiteUrl();
  const resolvedCitySlug = citySlug || normalizeSlug(cityName);

  const dynamicServiceTitle = service.title;
  const commonValues = {
    city: cityName,
    service: dynamicServiceTitle,
    hizmet: dynamicServiceTitle,
    sektor: ''
  };

  const contentTitle = formatUiText(serviceLocationUi?.contentTitle || 'Hizmet Açıklaması', commonValues);
  const descriptionTitle = formatUiText(serviceLocationUi?.descriptionTitle || 'Neden {service}?', commonValues);
  const contentHtml = AiOverviewsHelper.injectAiFriendlyMarkers(customContent || '');
  const descriptionHtml = AiOverviewsHelper.injectAiFriendlyMarkers(formatUiText(service.longDescription || service.description || '', commonValues));

  return (
    <main className="bg-[#f8f9fa] min-h-screen pt-24 pb-16 px-4">
      <StructuredData id="location-service-schema" data={locationSchema} />
      <div className="container-boxed bg-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[200px] bg-gradient-to-b from-black/[0.02] to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/[0.03] blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

        {visibility?.hero !== false ? (
          <section className="relative z-10 p-6 md:p-12 border-b border-[var(--border-subtle)]">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-12 items-center">
              <div>
                <div className="mb-10">
                  <Breadcrumbs
                    siteUrl={siteUrl}
                    crumbs={[
                      { label: 'Hizmetler', href: '/#hizmetler' },
                      { label: service.title, href: `/hizmetler/${service.slug || service.id}` },
                      { label: cityName, href: `/hizmetler/${service.slug}/${resolvedCitySlug}` },
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-8 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-[2px] bg-blue-600" />
                    <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">
                      {templateVariation?.heroBadge || `${cityName} ${serviceLocationUi?.heroBadgeSuffix || 'HİZMETLERİ'}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-fit">
                    {cityStats && cityStats.totalProjects > 0 && (
                      <>
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
                          <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                          <span className="text-[10px] md:text-[11px] font-black text-slate-700 uppercase tracking-tight">
                            {cityStats.totalProjects} PROJE
                          </span>
                        </div>
                        {cityStats.totalSqm > 0 && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600/5 border border-emerald-600/10 rounded-2xl">
                            <span className="text-[10px] md:text-[11px] font-black text-emerald-700 uppercase tracking-tight">
                              {cityStats.totalSqm.toLocaleString('tr-TR')} M² UYGULAMA
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <h1 className="text-xl md:text-2xl font-black text-black mb-8 italic tracking-tighter leading-[0.95]">
                  {templateVariation?.heroTitle
                    ? templateVariation.heroTitle
                    : <>{cityName} <span className="text-blue-600">{service.title}</span> {serviceLocationUi?.heroTitleSuffix || ''}</>
                  }
                </h1>

                <div className="text-black/40 text-lg md:text-xl font-black tracking-tight max-w-[580px] mb-6 leading-tight" dangerouslySetInnerHTML={{
                  __html: heroDescription || heroSection.description
                    || templateVariation?.heroDescription
                    || formatUiText(serviceLocationUi?.heroDescription || '{city} bölgesinde uzman {service} çözümleri.', commonValues)
                }} />

                {metadata ? (
                  <div className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed max-w-[580px]">
                    {`${cityName} için en yüksek yaz sıcaklığı ${metadata.max_temp_summer_c}°C, en düşük kış sıcaklığı ${metadata.min_temp_winter_c}°C olup, ${metadata.humidity_group === 'HIGH' ? 'yüksek nem' : metadata.humidity_group === 'LOW' ? 'düşük nem' : 'orta nem'} koşullarına dayanıklı zemin sistemleri uyguluyoruz.`}
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
                  <PhoneLink
                    phone={localPhone}
                    branch={branchInfo}
                    source="service-location-hero"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-black text-white rounded-2xl text-[14px] font-black transition-all duration-500 hover:bg-blue-600 hover:scale-105 shadow-2xl uppercase tracking-widest text-center"
                  >
                    <Phone size={20} strokeWidth={3} /> {localPhone}
                  </PhoneLink>
                  <Link href="/iletisim" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-white border border-black/5 text-black rounded-2xl text-[14px] font-black transition-all duration-500 hover:border-blue-600/20 hover:scale-105 shadow-xl uppercase tracking-widest text-center">
                    {serviceLocationUi?.freeDiscoveryCta || 'Ücretsiz Keşif'} <ArrowRight size={20} />
                  </Link>
                </div>

              </div>

              <div className="relative">
                <div className="rounded-[40px] overflow-hidden border border-black/5 shadow-2xl relative aspect-square group">
                  <CloudinaryImage
                    src={service.imagePath}
                    alt={`${cityName} ${service.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    className="object-cover transition-all duration-1000 group-hover:scale-110"
                    priority
                    fetchPriority="high"
                    fallbackSrc=""
                    locationName={locationName}
                    serviceName={serviceName}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* City Industry Profile - Phase 3: E-E-A-T Enhancement */}
        {cityIndustryProfile && (
          <CityIndustryProfile profile={cityIndustryProfile} className="py-12 border-b border-black/5" />
        )}

        <section className="py-12">
          {calculatorSection?.enabled ? (
            <ServiceCalculatorBlock
              service={service}
              metadata={metadata}
              pageType="pseo"
              cityName={cityName}
              settings={settings}
            />
          ) : calculatorSection?.showCTA ? (
            <CalculatorCTAButton
              serviceSlug={service.slug}
              citySlug={citySlug}
              cityName={cityName}
              buttonText={calculatorSection.ctaButtonText}
              icon={calculatorSection.ctaButtonIcon as 'Calculator' | 'ArrowRight' | 'DollarSign' | 'none' | undefined}
            />
          ) : null}
        </section>

        {/* Fallback / Statik Yapı (SEO Metinleri ve İklim Verisi Burada Render Edilir) */}
        {(visibility?.content !== false || visibility?.localHighlights !== false || visibility?.features !== false) ? (
          <section id="hizmet-detay" className="p-10 md:p-20 relative bg-[#fbfcff]/50">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.6fr] gap-20 items-start">
              <div>
                {visibility?.content !== false ? (
                  <>
                    <div className="flex flex-col gap-4 mb-10">
                      <div className="inline-flex items-center gap-3">
                        <div className="w-10 h-[2px] bg-blue-600" />
                        <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">
                          {templateVariation?.contentBadge || serviceLocationUi?.contentSectionBadge || 'HİZMET BİLGİSİ'}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">
                        {contentTitle}
                      </h2>
                      <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-3xl">
                        {formatUiText(serviceLocationUi?.contentIntro || 'Aşağıdaki açıklama, {city}’deki {service} çözümünü ve iş akışımızı daha hızlı anlamanıza yardımcı olur.', commonValues)}
                      </p>
                    </div>

                    <div className="space-y-8">
                      {contentHtml ? (
                        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
                          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                        </div>
                      ) : null}

                      <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
                        <div className="mb-6">
                          <h3 className="text-xl md:text-2xl font-black text-black mb-3">
                            {descriptionTitle}
                          </h3>
                          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl">
                            {formatUiText(serviceLocationUi?.descriptionIntro || '{service} hizmetimizle ilgili en sık tercih edilen avantajları ve kalite güvencemizi aşağıda bulabilirsiniz.', commonValues)}
                          </p>
                        </div>

                        <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {visibility?.features !== false && (service.features || typeof service.features === 'string') ? (
                <aside className="lg:sticky lg:top-32">
                  <div className="bg-white border border-black/5 rounded-[40px] p-10 shadow-xl">
                    <h3 className="text-xl font-black text-black mb-10 italic uppercase tracking-widest">{serviceLocationUi?.featuresTitle || 'Özellikler'}</h3>
                    <div className="flex flex-col gap-6 mb-12">
                      {(typeof service.features === 'string' ? JSON.parse(service.features || '[]') : service.features).map((feature: string) => (
                        <div key={feature} className="flex items-start gap-4">
                          <div className="mt-1 p-2 bg-blue-600/5 rounded-xl border border-blue-600/10 shrink-0">
                            <CheckCircle2 size={18} className="text-blue-600" strokeWidth={3} />
                          </div>
                          <span className="text-black/70 font-semibold text-sm leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* LEGO Block Builder - Dinamik Bloklar (OSB vb.) */}
        {blocks && blocks.length > 0 && (
          <div className="py-10">
            <BlockRenderer 
              blocks={blocks} 
              settings={settings} 
              locationName={locationName}
              serviceName={serviceName}
            />
          </div>
        )}

        {/* Şehirde Gerçekleştirilen Referans Projeler */}
        {cityReferences && cityReferences.length > 0 && (
          cityReferences.length >= 3 ? (
            // 3+ referans: sektörel gruplama ve trust sinyalleri
            <CityReferenceHighlights
              references={cityReferences}
              cityName={cityName}
              serviceName={serviceName}
              viewAllHref="/referanslar"
            />
          ) : (
            // Az referans: sade liste
            <CityReferencesSection
              references={cityReferences}
              cityName={cityName}
              serviceName={serviceName}
              viewAllHref="/referanslar"
            />
          )
        )}

        {/* Case Study Blocks - Phase 3 B3 */}
        {cityCaseStudies && cityCaseStudies.length > 0 && (
          <CityCaseStudyBlock
            caseStudies={cityCaseStudies}
            cityName={cityName}
            serviceTitle={serviceName || service.title}
          />
        )}

        {/* Uyumlu Sektörler Arayüzü */}
        {activeCompatibleSectors.length > 0 && (
          <section className="py-16 border-t border-black/5 relative z-10">
            <div className="flex flex-col gap-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-blue-600" />
                <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.25em]">
                  SEKTÖREL UYGULAMALARIMIZ
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-black italic tracking-tight">
                {cityName} Zemin Kaplama <span className="text-blue-600">Sektörel Çözümlerimiz</span>
              </h3>
              <p className="text-slate-500 text-sm md:text-base font-semibold max-w-[700px]">
                Bu zemin çözümü, {cityName} genelindeki çeşitli endüstriyel tesislerde ve ticari alanlarda sektörel standartlara tam uygun şekilde uygulanmaktadır.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeCompatibleSectors.map((sec) => (
                <div 
                  key={sec.id} 
                  className="group bg-white border border-black/5 rounded-2xl p-4 hover:border-blue-600/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full"
                >
                  <h4 className="text-sm font-black text-black tracking-tight group-hover:text-blue-600 transition-colors duration-300 mb-1.5 line-clamp-2">
                    {sec.name}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-4 mt-auto">
                    {sec.description
                      ? sec.description
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .replace(new RegExp(`^${cityName}\\s*bölgesindeki\\s*`, 'i'), '')
                          .replace(/^bölgesindeki\s*/i, '')
                          .substring(0, 160) + (sec.description.length > 160 ? '...' : '')
                      : `${sec.name} için zemin kaplama çözümü.`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic pSEO FAQ Section - Only render if not already in blocks */}
        {faqs && faqs.length > 0 && !blocks?.some(block => block.type === 'faq_section') && (
          <FaqSection 
            faqs={faqs.map(faq => ({
              ...faq,
              question: faq.question.replace(/{city}/g, cityName),
              answer: faq.answer.replace(/{city}/g, cityName)
            }))} 
            title={`${cityName} Sıkça Sorulan Sorular`}
          />
        )}

        {/* Dynamic Internal Cross-Linking Section */}
        {otherServices.length > 0 && (
          <section className="py-12 border-t border-black/5 relative z-10">
            <h3 className="text-xl md:text-2xl font-black text-black mb-8 italic tracking-tight">
              {cityName} <span className="text-blue-600">Bölgesindeki Diğer Hizmetlerimiz</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherServices.map((otherSvc) => (
                <Link 
                  key={otherSvc.id}
                  href={`/hizmetler/${otherSvc.slug}/${normalizeSlug(cityName)}`}
                  prefetch={false}
                  className="group flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl hover:border-blue-600/30 hover:shadow-lg transition-all"
                >
                  <span className="text-sm font-bold text-black/80 group-hover:text-blue-600 transition-colors">
                    {otherSvc.title}
                  </span>
                  <ArrowRight size={16} className="text-black/20 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic pSEO Service Areas Section */}
        <ServiceAreasSection
          pseoMode={settings?.pseo_mode || 'off'}
          serviceSlug={service.slug}
          currentCitySlug={normalizeSlug(cityName)}
          cities={cities}
          title={serviceLocationUi?.allRegionsTitle}
        />
      </div>
    </main>
  );
}
