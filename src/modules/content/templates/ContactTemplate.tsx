import ContactSection from '@/modules/content/sections/ContactSection';
// settings passed via props when needed
import FaqSection from '@/modules/content/sections/FaqSection';
import BlockRenderer from './BlockRenderer';

interface ContactTemplateProps {
  contentData: any;
  servicesData?: any[];
  referencesData?: any[];
  statsData?: any[];
  heroData?: any;
  sectionContentData?: any;
  branchesData?: any[];
  categoriesData?: any[];
  allPagesData?: any[];
  faqs?: any[];
  settings?: any;
}

export default function ContactTemplate({ 
  contentData,
  servicesData,
  referencesData,
  statsData,
  heroData,
  sectionContentData,
  branchesData,
  categoriesData,
  allPagesData,
  faqs,
  settings
}: ContactTemplateProps) {
  const showFaq = settings?.faq_visibility?.includes('contact') ?? false;

  return (
    <>
      <ContactSection 
        badge={contentData.badge}
        title={contentData.title}
        subtitle={contentData.subtitle}
        showForm={contentData.showForm !== false} 
      />
      
      {showFaq && faqs && faqs.length > 0 && (
        <FaqSection faqs={faqs} />
      )}

      <div className="container-boxed max-w-[1100px] mx-auto px-4 md:px-6">
        <BlockRenderer 
          blocks={contentData.blocks}
          servicesData={servicesData}
          referencesData={referencesData}
          statsData={statsData}
          heroData={heroData}
          sectionContentData={sectionContentData}
          branchesData={branchesData}
          categoriesData={categoriesData}
          allPagesData={allPagesData}
        />
      </div>
    </>
  );
}
