import { Metadata } from 'next';
import { MetaGenerator } from '@/domains/seo-engine';
import ContactSection from '@/modules/content/sections/ContactSection';
import ContactTemplate from '@/modules/content/templates/ContactTemplate';
import StructuredData from '@/modules/seo/components/StructuredData';
import { getSiteUrl } from '@/core/utils/host';
import {
  getPage,
  getHeroIntro,
  getReferences,
  getServices,
  getStats,
  getSectionContent,
  getBranches,
  getServiceCategories,
  getAllPages,
  getFaqsForPage,
  getSettings,
} from '@/lib/data';

export const revalidate = 604800; // 1 week cache

export async function generateMetadata(): Promise<Metadata> {
  return MetaGenerator.generate({ pageKey: 'iletisim' });
}

function buildContactSchemas(settings: any, siteUrl: string) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'İletişim',
      description: 'ERTEM ile iletişime geçin.',
      url: `${siteUrl}/iletisim`,
      mainEntity: {
        '@type': 'LocalBusiness',
        name: settings?.companyName || 'ERTEM',
        telephone: settings?.phone,
        email: settings?.email,
        address: settings?.address ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressCountry: 'TR',
        } : undefined,
        sameAs: (settings?.socialMedia || []).filter((s: any) => s.active).map((s: any) => s.url),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'İletişim', item: `${siteUrl}/iletisim` },
      ],
    },
  ];
}

export default async function ContactPage() {
  const [
    page, 
    servicesData, 
    referencesData, 
    statsData, 
    heroData, 
    sectionContentData, 
    branchesData, 
    categoriesData, 
    allPages,
    faqs,
    settings,
  ] = await Promise.all([
    getPage('/iletisim'),
    getServices(),
    getReferences(),
    getStats(),
    getHeroIntro(),
    getSectionContent(),
    getBranches(),
    getServiceCategories(),
    getAllPages(),
    getFaqsForPage('contact'),
    getSettings().catch(() => null),
  ]);

  const siteUrl = await getSiteUrl();
  const contactSchema = buildContactSchemas(settings, siteUrl);

  if (!page) {
    return (
      <main className="pt-20">
        <StructuredData id="contact-schema" data={contactSchema} />
        <ContactSection />
      </main>
    );
  }

  const contentData = typeof page.content_data === 'string'
    ? JSON.parse(page.content_data as string)
    : (page.content_data || {});

  return (
    <>
      <StructuredData id="contact-schema" data={contactSchema} />
      <ContactTemplate
        contentData={contentData}
        servicesData={servicesData}
        referencesData={referencesData}
        statsData={statsData}
        heroData={heroData}
        sectionContentData={sectionContentData}
        branchesData={branchesData}
        categoriesData={categoriesData}
        allPagesData={allPages}
        faqs={faqs}
      />
    </>
  );
}


