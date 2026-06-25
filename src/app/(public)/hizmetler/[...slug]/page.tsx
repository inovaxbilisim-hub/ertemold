import { notFound, permanentRedirect } from 'next/navigation';
import { getServices, getServiceDetail, getServiceCategories } from '@/lib/data';

// Component imports
import ServiceDetailContent from '@/modules/content/templates/ServiceDetailContent';
import ServiceLocationTemplate from '@/modules/content/templates/ServiceLocationTemplate';
import ServiceCalculatorTemplate from '@/modules/content/templates/ServiceCalculatorTemplate';
import { getAllCities } from '@/modules/content/lib/services';
import { getSettings, getStats, getFaqsForPage } from '@/lib/data';

import { resolvePseoParams, generatePseoContent } from '@/modules/seo/lib/pseo-utils';
import { toTurkishTitleCase } from '@/modules/seo/lib/service-utils';
import { getCityStats, getCityFAQs, getCityCaseStudiesData } from '@/modules/content/lib/data-services';
import { buildPseoBlocks } from '@/modules/content/lib/block-builder';
import { checkCityContentQuality, shouldShowCityPage } from '@/modules/content/lib/content-quality';
import { getDominantSector, getTemplateVariation, buildVariationText } from '@/modules/content/lib/template-variations';
import StructuredData from '@/modules/seo/components/StructuredData';
import { buildFaqSchema } from '@/modules/seo/lib/faq-schema';
import { getSiteUrl } from '@/core/utils/host';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { CONTENT_INJECT_SECTION } from '@/core/hooks/hooks';
import { MetaGenerator, EntityExtractor, KnowledgeGraph, SpeakableGenerator, SchemaGenerator } from '@/domains/seo-engine';
import { PseoDataService } from '@/domains/pseo';



// Generate static params for primary services only (others are on-demand)
export async function generateStaticParams() {
  const services = await getServices();
  return services.map(s => ({ slug: [s.slug] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slugs = resolvedParams.slug;

  if (slugs.length === 1) {
    const service = await getServiceDetail(slugs[0]);
    if (service && service.active) {
      const settings = await getSettings().catch(() => null);
      return MetaGenerator.generate({
        title: service.seoTitle || `${service.title} Hizmetleri`,
        description: service.seoDescription || service.description,
        canonicalPath: `/hizmetler/${service.slug}`,
        settings,
      });
    }
  } else {
    const settings = await getSettings().catch(() => null);
    const pseo = await resolvePseoParams(slugs, settings);
    if (pseo) {
      const { title, description } = generatePseoContent(pseo, settings);
      return MetaGenerator.generate({
        title,
        description,
        canonicalPath: `/hizmetler/${slugs.join('/')}`,
        settings,
      });
    }
  }
  return { title: 'Sayfa Bulunamadı' };
}

export default async function CatchAllServicePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slugs = resolvedParams.slug;

  if (slugs.length === 1) {
    return renderPrimaryServicePage(slugs[0]);
  }

  const settings = await getSettings().catch(() => null);
  const pseo = await resolvePseoParams(slugs, settings);
  if (!pseo) {
    const allServices = await getServices();
    const baseService = allServices.find(s => s.slug === slugs[0] && s.active);
    if (baseService) {
      permanentRedirect(`/hizmetler/${baseService.slug}`);
    }
    return notFound();
  }

  return renderPseoPage(pseo, slugs, settings);
}

async function renderPrimaryServicePage(serviceSlug: string) {
  const service = await getServiceDetail(serviceSlug);
  if (!service || !service.active) {
    const allServices = await getServices();
    const closestMatch = allServices.find(s => serviceSlug.includes(s.slug) || s.slug.includes(serviceSlug));
    if (closestMatch) {
      permanentRedirect(`/hizmetler/${closestMatch.slug}`);
    }
    permanentRedirect('/hizmetler');
  }

  const categories = await getServiceCategories();
  const category = categories.find(c => c.id === service.category_id);
  const cities = await getAllCities();
  const settings = await getSettings().catch(() => null);
  const serviceSpecificFaqs = service.serviceFaqs && service.serviceFaqs.length > 0
    ? service.serviceFaqs
    : await getFaqsForPage('service_detail');

  const [faqs, serviceReferences] = await Promise.all([
    Promise.resolve(serviceSpecificFaqs),
    PseoDataService.getReferencesForService(service.slug, 6).catch(() => []),
  ]);

  const injectedSections = HookRegistry.applyFilters<any>(CONTENT_INJECT_SECTION, {
    features: service.features,
    trustSection: settings?.uiContent?.serviceDetail,
    calculator: null,
  }, { service, category, settings, template: 'ServiceDetailContent' });

  const serviceSchema = await SchemaGenerator.buildServiceSchema({
    service,
    settings,
    canonicalPath: `/hizmetler/${service.slug}`,
    categoryLabel: category?.name,
  });

  const svcEntityResult = EntityExtractor.extract({
    content: service.seoDescription || service.description || service.title,
    pageType: 'service_detail',
    serviceName: service.title,
  });
  const svcEntityGraph = EntityExtractor.buildEntityGraph(svcEntityResult.entities);

  const svcKgResult = await KnowledgeGraph.build({
    settings,
    services: [service],
  });

  const svcSpeakableSchema = await SpeakableGenerator.build({
    title: service.title,
    description: service.seoDescription || service.description || '',
    pageType: 'service_detail',
  });

  const howToSchema = SchemaGenerator.buildHowToSchema(
    service.title,
    service.seoDescription || service.description || '',
    (service.features || []) as string[],
  );

  const siteUrl = await getSiteUrl();

  return (
    <>
      <StructuredData id={`service-${service.id}-schema`} data={serviceSchema || {}} />
      {faqs && faqs.length > 0 && (
        <StructuredData id={`service-${service.id}-faq-schema`} data={buildFaqSchema(faqs) || []} />
      )}
      <StructuredData id={`service-${service.id}-entity-graph`} data={svcEntityGraph} />
      {svcKgResult['@graph'].length > 0 && (
        <StructuredData id={`service-${service.id}-knowledge-graph`} data={svcKgResult} />
      )}
      <StructuredData id={`service-${service.id}-speakable`} data={svcSpeakableSchema} />
      {howToSchema['@type'] && (
        <StructuredData id={`service-${service.id}-howto`} data={howToSchema} />
      )}
      <ServiceDetailContent
        service={service}
        category={category?.slug || ''}
        cities={cities}
        faqs={faqs}
        siteUrl={siteUrl}
        serviceReferences={serviceReferences}
        injectedSections={injectedSections}
      />
    </>
  );
}

async function renderPseoPage(pseo: any, slugs: string[], settings: any) {
  const locationSlug = pseo.location.citySlug;
  const locationName = toTurkishTitleCase(pseo.location.cityName);
  const canonicalPath = `/hizmetler/${slugs.join('/')}`;

  const [globalFaqs, cityFaqs, metadata, cityReferences, stats, cityStats, cities, cityIndustryProfile, cityCaseStudies] = await Promise.all([
    getFaqsForPage('pseo'),
    locationSlug ? getCityFAQs(locationSlug, pseo.service.slug).catch(() => []) : Promise.resolve([]),
    locationSlug ? PseoDataService.getLocationMetadata(locationSlug).catch(() => null) : Promise.resolve(null),
    locationSlug ? PseoDataService.getReferencesForCity(locationSlug, 3).catch(() => []) : Promise.resolve([]),
    getStats().catch(() => []),
    locationSlug ? getCityStats(locationSlug).catch(() => null) : Promise.resolve(null),
    getAllCities(),
    locationSlug ? (async () => {
      const { getCityIndustryProfile } = await import('@/modules/content/lib/data-services');
      return getCityIndustryProfile(locationSlug, pseo.service.slug).catch(() => null);
    })() : Promise.resolve(null),
    locationSlug ? getCityCaseStudiesData(locationSlug, pseo.service.slug).catch(() => []) : Promise.resolve([]),
  ]);

  // Prioritize city-specific FAQs over global FAQs
  const faqs = cityFaqs.length > 0 ? cityFaqs : globalFaqs;
  
  console.log(`[Page] ${locationName} FAQs:`, {
    citySpecific: cityFaqs.length,
    global: globalFaqs.length,
    using: cityFaqs.length > 0 ? 'city-specific' : 'global',
  });

  // ========================================
  // CONTENT QUALITY CHECK
  // Prevent thin content pages
  // ========================================
  const qualityCheck = checkCityContentQuality(
    locationSlug || '',
    cityStats,
    cityReferences,
    metadata,
    settings
  );

  console.log(`[Content Quality] ${locationName} for ${pseo.service.title}:`, {
    score: qualityCheck.score,
    passes: qualityCheck.passesThreshold,
    details: qualityCheck.details,
  });

  if (!shouldShowCityPage(qualityCheck, settings)) {
    console.log(`[Content Quality] Redirecting ${locationName} to main service page (insufficient data)`);
    // Redirect to main service page instead of showing thin content
    permanentRedirect(`/hizmetler/${pseo.service.slug}`);
  }

  const blocks = buildPseoBlocks({
    service: pseo.service,
    location: {
      name: pseo.location.name,
      cityName: pseo.location.cityName,
    },
    metadata,
    faqs,
    settings,
  });

  const { description, body } = generatePseoContent(pseo, settings, metadata);
  const heroCustomContent = body || `<p>${description}</p>`;
  const locSlug = pseo.location.slug;

  // ========================================
  // TEMPLATE VARIATION - B4
  // Sector-based content differentiation
  // ========================================
  const dominantSector = locationSlug
    ? await getDominantSector(locationSlug).catch(() => 'default' as const)
    : 'default' as const;

  const templateVariation = getTemplateVariation(dominantSector);
  const variationText = buildVariationText(templateVariation, locationName, pseo.service.title);

  console.log(`[Template Variation] ${locationName}: sector=${dominantSector}, badge="${variationText.heroBadge}"`);

  const branchInfo = settings?.branches?.find((b:any) => b.active && b.city_slug === locationSlug)
    || settings?.branches?.find((b:any) => b.type === 'merkez');

  const mappedService = {
    ...pseo.service,
    longDescription: pseo.service.longDescription || pseo.service.long_description,
    imagePath: pseo.service.imagePath || pseo.service.image_path,
    iconColor: pseo.service.iconColor || pseo.service.icon_color,
    iconBgColor: pseo.service.iconBgColor || pseo.service.icon_bg_color,
    features: pseo.service.features || [],
  };

  const siteUrl = await getSiteUrl();

  const locationSchema = await SchemaGenerator.buildLocationServiceSchema({
    service: mappedService,
    settings,
    branch: branchInfo,
    cityName: locationName,
    citySlug: locationSlug,
    canonicalPath,
    categoryLabel: pseo.service.category_name || undefined,
    metadata,
    faqs,
  });

  const pseoEntityResult = EntityExtractor.extract({
    content: description,
    pageType: 'pseo_location',
    serviceName: mappedService.title,
    cityName: pseo.location.cityName,
  });
  const pseoEntityGraph = EntityExtractor.buildEntityGraph(pseoEntityResult.entities);

  const pseoKgResult = await KnowledgeGraph.build({
    settings,
    services: [mappedService],
    locations: [{
      name: pseo.location.cityName,
      cityName: pseo.location.cityName,
      slug: pseo.location.citySlug,
    }],
  });

  const pseoSpeakableSchema = await SpeakableGenerator.build({
    title: mappedService.title,
    description,
    pageType: 'pseo_location',
  });

  const pseoHowToSchema = SchemaGenerator.buildHowToSchema(
    mappedService.title,
    description,
    (mappedService.features || []) as string[],
  );

  if (pseo.isM2PricePage) {
    return (
      <>
        <StructuredData id={`pseo-${mappedService.id}-entity-graph`} data={pseoEntityGraph} />
        {pseoKgResult['@graph'].length > 0 && (
          <StructuredData id={`pseo-${mappedService.id}-knowledge-graph`} data={pseoKgResult} />
        )}
        <StructuredData id={`pseo-${mappedService.id}-speakable`} data={pseoSpeakableSchema} />
        {pseoHowToSchema['@type'] && (
          <StructuredData id={`pseo-${mappedService.id}-howto`} data={pseoHowToSchema} />
        )}
        <ServiceCalculatorTemplate
          service={mappedService}
          cityName={locationName}
          citySlug={pseo.location.citySlug || undefined}
          heroDescription={description}
          customContent={heroCustomContent}
          siteUrl={siteUrl}
          metadata={metadata}
        />
      </>
    );
  }

  return (
    <>
      <StructuredData id={`pseo-service-${mappedService.id}-schema`} data={locationSchema || {}} />
      {faqs && faqs.length > 0 && (
        <StructuredData id={`pseo-service-${mappedService.id}-faq-schema`} data={buildFaqSchema(faqs) || []} />
      )}
      <StructuredData id={`pseo-${mappedService.id}-entity-graph`} data={pseoEntityGraph} />
      {pseoKgResult['@graph'].length > 0 && (
        <StructuredData id={`pseo-${mappedService.id}-knowledge-graph`} data={pseoKgResult} />
      )}
      <StructuredData id={`pseo-${mappedService.id}-speakable`} data={pseoSpeakableSchema} />
      {pseoHowToSchema['@type'] && (
        <StructuredData id={`pseo-${mappedService.id}-howto`} data={pseoHowToSchema} />
      )}
      <ServiceLocationTemplate
        service={mappedService}
        cityName={locationName}
        citySlug={pseo.location.citySlug}
        locSlug={locSlug}
        cities={cities}
        settings={settings}
        branchInfo={branchInfo}
        heroDescription={description}
        customContent={heroCustomContent}
        faqs={faqs}
        stats={stats}
        locationSchema={locationSchema}
        blocks={blocks}
        locationName={locationName}
        serviceName={pseo.service.title}
        cityReferences={cityReferences}
        cityStats={cityStats}
        metadata={metadata}
        cityIndustryProfile={cityIndustryProfile}
        cityCaseStudies={cityCaseStudies}
        templateVariation={variationText}
      />
    </>
  );
}
