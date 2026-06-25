import { replacePlaceholders } from '@/modules/settings/lib/ui-content';
import MasonryHero from '@/modules/content/sections/MasonryHero';
import StatsSection from '@/modules/content/sections/StatsSection';
import ServicesSection from '@/modules/content/sections/ServicesSection';
import ReferencesSection from '@/modules/content/sections/ReferencesSection';
import ContactSection from '@/modules/content/sections/ContactSection';
import { HeroData, HeroUiContent, Stat, Service, Reference, SectionContent, ServiceCategory, FAQ } from '@/core/types';
import BlockRenderer from '@/modules/content/templates/BlockRenderer';
import FaqSection from '@/modules/content/sections/FaqSection';
import HomeTemplateHooks from '@/modules/content/templates/HomeTemplateHooks';


interface HomeTemplateProps {
  blocks?: any[];
  heroData: HeroData | null;
  heroUi: HeroUiContent;
  statsData: Stat[];
  servicesData: Service[];
  categoriesData: ServiceCategory[];
  referencesData: Reference[];
  sectionContentData: Record<string, SectionContent>;
  sector?: string;
  settings?: any;
  currentPageId?: string | number;
  allPagesData?: any[];
  faqs?: FAQ[];
}

const defaultHeroUi: HeroUiContent = {
  statusBadge: '',
  statusText: '',
  fallbackBadge: '',
  fallbackTitle: '',
  fallbackCtaText: '',
  fallbackSecondaryCtaText: '',
};

export default function HomeTemplate({
  settings,
  ...props
}: HomeTemplateProps) {
  return (
    <HomeTemplateHooks settings={settings}>
      <HomeTemplateInner settings={settings} {...props} />
    </HomeTemplateHooks>
  );
}

function HomeTemplateInner({ 
  blocks,
  heroData, 
  heroUi, 
  statsData, 
  servicesData, 
  categoriesData,
  referencesData, 
  sectionContentData,
  sector = 'Kurumsal',
  settings,
  currentPageId,
  allPagesData,
  faqs = []
}: HomeTemplateProps) {
  const heroUiContent = settings?.uiContent?.hero;
  const values = { sector, companyName: settings?.companyName || '' };
  
  const defaultHero = { 
    active: true, 
    left: { 
      badge: heroUiContent?.fallbackBadge || '', 
      title: heroUiContent?.fallbackTitle || '', 
      description: '', 
      ctaText: heroUiContent?.fallbackCtaText || 'Hizmetlerimiz', 
      ctaLink: '/hizmetler', 
      ctaSecondaryText: heroUiContent?.fallbackSecondaryCtaText || 'İletişim', 
      ctaSecondaryLink: '/iletisim' 
    }, 
    gallery: [] 
  };

  const processedHeroData = heroData ? replacePlaceholders(heroData, values) : null;
  const processedServicesData = replacePlaceholders(servicesData, values);
  const processedReferencesData = replacePlaceholders(referencesData, values);
  const processedSectionContentData = replacePlaceholders(sectionContentData, values);
  const processedBlocks = blocks ? replacePlaceholders(blocks, values) : null;
  const processedStatsData = replacePlaceholders(statsData, values);

  // Check if Hero is already in blocks
  const hasHeroInBlocks = processedBlocks?.some((b: any) => 
    (b.type === 'component_ref' && b.data?.component === 'Hero') ||
    (b.type === 'page_ref' && allPagesData?.find(p => String(p.id) === String(b.data?.pageId))?.template_name === 'home')
  );

  return (
    <>
      {/* Always show Hero at top if not explicitly added as a block */}
      {!hasHeroInBlocks && (
        <MasonryHero 
          data={processedHeroData || replacePlaceholders(defaultHero, values)}
          heroUi={heroUi || defaultHeroUi}
        />
      )}

      {processedBlocks && processedBlocks.length > 0 ? (
        <BlockRenderer 
          blocks={processedBlocks}
          heroData={processedHeroData || replacePlaceholders(defaultHero, values)}
          statsData={processedStatsData}
          servicesData={processedServicesData}
          categoriesData={categoriesData}
          referencesData={processedReferencesData}
          sectionContentData={processedSectionContentData}
          allPagesData={allPagesData}
          renderedPageIds={currentPageId ? [String(currentPageId)] : []}
        />
      ) : (
        <>
          <StatsSection 
            stats={processedStatsData} 
          />
          <ServicesSection 
            variant="home" 
            services={processedServicesData} 
            initialCategories={categoriesData}
            sectionContent={processedSectionContentData?.services} 
          />
          <ReferencesSection 
            data={processedReferencesData} 
            sectionContent={processedSectionContentData?.references} 
          />
        </>
      )}
      
      <ContactSection 
        showForm={true} 
      />

      {settings?.faq_visibility?.includes('home') && faqs.length > 0 && (
        <FaqSection 
          faqs={faqs} 
          title={settings?.uiContent?.faq?.title || 'Sıkça Sorulan Sorular'}
        />
      )}
    </>
  );
}
