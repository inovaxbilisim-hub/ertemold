import { Metadata } from 'next';
import { getServices, getReferences, getHeroIntro, getStats, getSectionContent, getSettings, getServiceCategories, getAllPages, getFaqsForPage, getPage } from '@/lib/data';
import HomeTemplate from '@/modules/content/templates/HomeTemplate';
import StructuredData from '@/modules/seo/components/StructuredData';
import { buildFaqSchema } from '@/modules/seo/lib/faq-schema';
import { MetaGenerator, EntityExtractor, KnowledgeGraph, SpeakableGenerator, SchemaGenerator } from '@/domains/seo-engine';
import { defaultUiContent } from '@/modules/settings/lib/ui-content';

export const dynamic = 'auto';
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  // Pass 'home' as the key, the SEO engine is now updated to check the 'pages' table for this key
  return MetaGenerator.generate({ pageKey: 'home' });
}

export default async function HomePage() {
  const [servicesData, referencesData, heroData, statsData, sectionContentData, settings, categoriesData, homePageResult, allPages, faqs] = await Promise.all([
    getServices(),
    getReferences(),
    getHeroIntro(),
    getStats(),
    getSectionContent(),
    getSettings(),
    getServiceCategories(),
    getPage('/'),
    getAllPages(),
    getFaqsForPage('home'),
  ]);

  const homePage = homePageResult || null;
  const blocks = homePage?.content_data ? (typeof homePage.content_data === 'string' ? JSON.parse(homePage.content_data).blocks : (homePage.content_data as any).blocks) : null;

  const homeEntityResult = EntityExtractor.extract({
    content: settings?.companyDescription || settings?.title || '',
    pageType: 'home',
    serviceName: servicesData[0]?.title,
  });
  const homeEntityGraph = EntityExtractor.buildEntityGraph(homeEntityResult.entities);

  const homeKgResult = await KnowledgeGraph.build({
    settings,
    services: servicesData.filter((s: any) => s.active),
  });

  const homeSpeakableSchema = await SpeakableGenerator.build({
    title: settings?.title || 'Ana Sayfa',
    description: settings?.companyDescription || '',
    pageType: 'home',
  });

  return (
    <>
      <StructuredData id="global-schema" data={await SchemaGenerator.buildGlobalSchema(settings)} />
      {faqs && faqs.length > 0 && (
        <StructuredData id="home-faq-schema" data={buildFaqSchema(faqs) || []} />
      )}
      <StructuredData id="home-entity-graph" data={homeEntityGraph} />
      {homeKgResult['@graph'].length > 0 && (
        <StructuredData id="home-knowledge-graph" data={homeKgResult} />
      )}
      <StructuredData id="home-speakable" data={homeSpeakableSchema} />
      <HomeTemplate 
        blocks={blocks}
        heroData={heroData}
        heroUi={settings?.uiContent?.hero ?? defaultUiContent.hero}
        statsData={statsData}
        servicesData={servicesData}
        categoriesData={categoriesData}
        referencesData={referencesData}
        sectionContentData={sectionContentData}
        sector={settings?.sector}
        settings={settings}
        currentPageId={homePage?.id as string | number | undefined}
        allPagesData={allPages}
        faqs={faqs}
      />
    </>
  );
}
