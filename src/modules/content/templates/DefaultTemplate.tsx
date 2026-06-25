import CloudinaryImage from '@/shared/components/CloudinaryImage';
import BlockRenderer from './BlockRenderer';
import FaqSection from '@/modules/content/sections/FaqSection';
import { AiOverviewsHelper } from '@/domains/seo-engine/aeo/AiOverviewsHelper';

interface DefaultTemplateProps {
  contentData: any;
  servicesData?: any;
  referencesData?: any;
  statsData?: any;
  heroData?: any;
  sectionContentData?: any;
  branchesData?: any;
  categoriesData?: any;
  allPagesData?: any[];
  faqs?: any[];
  settings?: any;
}

export default function DefaultTemplate({ 
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
  settings,
}: DefaultTemplateProps & { settings?: any }) {
  const showFaq = settings?.faq_visibility?.includes('page') ?? false;
  
  const aeoSummary = AiOverviewsHelper.buildAeoSummaryBlock({
    title: contentData.title || '',
    description: contentData.description || '',
    features: [],
  });
  
  return (
    <div className="bg-white min-h-[60vh]">
      <div className="sr-only" data-aeo="summary">{aeoSummary}</div>
      {/* Static Hero Image (Existing Field) */}
      {contentData.image && (
        <div className="relative w-full h-[40vh] md:h-[60vh] border-b border-black/5">
          <CloudinaryImage
            src={contentData.image}
            alt={contentData.main_title || 'Sayfa Görseli'}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
      )}

      <div className="container-boxed max-w-[1100px] mx-auto px-4 md:px-6 relative">
        <div className="pt-16 pb-24">
          
          {/* Static Title (Existing Field) */}
          {contentData.main_title && (
            <h1 className="text-4xl md:text-7xl font-black text-black mb-12 italic uppercase tracking-tighter leading-[0.85] max-w-[800px]">
              {contentData.main_title}
            </h1>
          )}

          {/* Static Body (Existing Field) */}
          {contentData.body && (
            <div 
              className="prose prose-xl max-w-none text-black/70 font-medium leading-relaxed mb-20
                         prose-h2:text-4xl prose-h2:font-black prose-h2:uppercase prose-h2:tracking-tight prose-h2:text-black
                         prose-p:mb-8 prose-a:text-blue-600 prose-a:underline decoration-blue-600/30 underline-offset-8"
              dangerouslySetInnerHTML={{ __html: AiOverviewsHelper.injectAiFriendlyMarkers(contentData.body || '').replace(/\n/g, '<br />') }}
            />
          )}

          {/* Dynamic Blocks */}
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
            settings={settings}
          />
          
          {!contentData.main_title && !contentData.body && !contentData.image && (!contentData.blocks || contentData.blocks.length === 0) && (
             <div className="text-center py-40 text-black/20 font-black uppercase tracking-[0.2em] border-4 border-dashed border-black/5 rounded-[3rem]">
               Henüz içerik eklenmemiş.
             </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      {showFaq && faqs && faqs.length > 0 && (
        <div className="border-t border-black/5">
          <FaqSection faqs={faqs} />
        </div>
      )}
    </div>
  );
}
