import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import DefaultTemplate from '@/modules/content/templates/DefaultTemplate';
import AboutTemplate from '@/modules/content/templates/AboutTemplate';
import ServiceTemplate from '@/modules/content/templates/ServiceTemplate';
import ContactTemplate from '@/modules/content/templates/ContactTemplate';
import ReferencesTemplate from '@/modules/content/templates/ReferencesTemplate';
import StructuredData from '@/modules/seo/components/StructuredData';
import { buildFaqSchema } from '@/modules/seo/lib/faq-schema';
import { EntityExtractor, KnowledgeGraph, SpeakableGenerator, SchemaGenerator } from '@/domains/seo-engine';
import { getPage, getServiceCategories } from '@/lib/data';
import { generateDynamicMetadata } from './page-seo';
import { fetchDynamicPageData } from './page-data';
import CategoryLandingPage from './category-landing';

import { getAllPages } from '@/domains/content/lib/data-pages';

export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages.map((page) => ({
    slug: page.slug.split('/'),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  return generateDynamicMetadata(slug);
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: segments } = await params;
  const path = '/' + segments.join('/');

  const page =
    (await getPage(path)) ||
    (path.startsWith('/') ? await getPage(path.slice(1)) : null);
  if (page && page.is_published) {
    const data = await fetchDynamicPageData(path, page);

    const renderTemplate = () => {
      const sharedProps = {
        contentData: data.page.contentData,
        servicesData: data.servicesData,
        referencesData: data.referencesData,
        statsData: data.statsData,
        heroData: data.heroData,
        sectionContentData: data.sectionContentData,
        branchesData: data.branchesData,
        categoriesData: data.categoriesData,
        allPagesData: data.allPages,
        faqs: data.faqs,
        settings: data.settingsData,
      };

      switch (page.template_name) {
        case 'about': return <AboutTemplate {...sharedProps} />;
        case 'service':
        case 'sektorler_index':
        case 'sektorler_detail':
          return <ServiceTemplate {...sharedProps} sectorsData={data.sectorsData} />;
        case 'contact': return <ContactTemplate {...sharedProps} />;
        case 'references': return <ReferencesTemplate {...sharedProps} />;
        default: return <DefaultTemplate {...sharedProps} />;
      }
    };

    const dbEntityResult = EntityExtractor.extract({
      content: (page.title as string) || '',
      pageType: (page.template_name as string) || 'default',
    });
    const dbEntityGraph = EntityExtractor.buildEntityGraph(dbEntityResult.entities);
    const dbKgResult = await KnowledgeGraph.build({ settings: data.settingsData, services: data.servicesData.filter((s: any) => s.active) });
    const dbSpeakableSchema = await SpeakableGenerator.build({
      title: (page.title as string) || 'Sayfa',
      description: (data.page.contentData?.description as string) || '',
      pageType: (page.template_name as string) || 'default',
    });

    const crumbs = [{ label: "Ana Sayfa", href: "/" }];
    let currentPath = "";
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      const isLast = i === segments.length - 1;
      crumbs.push({
        label: isLast ? (page.title as string) || segments[i] : segments[i],
        href: currentPath
      });
    }
    const breadcrumbSchema = await SchemaGenerator.buildBreadcrumbSchema({ crumbs, settings: data.settingsData });

    return (
      <>
        <StructuredData id={`${page.id}-global-schema`} data={await SchemaGenerator.buildGlobalSchema(data.settingsData)} />
        {data.faqs?.length > 0 && (
          <StructuredData id={`${page.id}-faq-schema`} data={buildFaqSchema(data.faqs) || []} />
        )}
        <StructuredData id={`${page.id}-entity-graph`} data={dbEntityGraph} />
        {dbKgResult['@graph']?.length > 0 && (
          <StructuredData id={`${page.id}-knowledge-graph`} data={dbKgResult} />
        )}
        <StructuredData id={`${page.id}-speakable`} data={dbSpeakableSchema} />
        <StructuredData id={`${page.id}-breadcrumb`} data={breadcrumbSchema} />
        {renderTemplate()}
      </>
    );
  }

  if (segments.length === 1) {
    const allCategories = await getServiceCategories();
    const category = allCategories.find(c => c.slug === segments[0] && c.active);
    if (category) return <CategoryLandingPage categorySlug={segments[0]} />;
  }

  notFound();
}
