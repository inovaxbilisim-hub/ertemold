import ServicesSection from '@/modules/content/sections/ServicesSection';
import BlockRenderer from './BlockRenderer';
import FaqSection from '@/modules/content/sections/FaqSection';
import { AiOverviewsHelper } from '@/domains/seo-engine/aeo/AiOverviewsHelper';
import { ContextualLinker } from '@/domains/seo-engine/seo/ContextualLinker';
import * as LucideIcons from 'lucide-react';

interface ServiceTemplateProps {
  contentData: any;
  servicesData: any[];
  sectionContentData: any;
  referencesData?: any;
  statsData?: any;
  heroData?: any;
  branchesData?: any;
  categoriesData?: any;
  allPagesData?: any[];
  faqs?: any[];
  settings?: any;
  sectorsData?: any[];
}

export default function ServiceTemplate({ 
  contentData, 
  servicesData, 
  sectionContentData,
  referencesData,
  statsData,
  heroData,
  branchesData,
  categoriesData,
  allPagesData,
  faqs,
  sectorsData = [],
  settings,
}: ServiceTemplateProps & { settings?: any }) {
  const showFaq = settings?.faq_visibility?.includes('service') ?? false;
  
  const servicesSectionContent = sectionContentData?.services || sectionContentData?.guvenlik;
  const badge = typeof contentData.badge === 'string' ? contentData.badge : undefined;
  const title = typeof contentData.title === 'string' ? contentData.title : undefined;
  const subtitle = typeof contentData.subtitle === 'string' ? contentData.subtitle : undefined;

  // Uyumlu sektörleri bul
  const currentService = servicesData.find(s => 
    s.title === title || 
    s.slug === contentData.slug || 
    (contentData.slug && s.slug === contentData.slug)
  );
  
  const compatibleSlugs = currentService?.compatible_sectors || [];

  const sektorVisibility = contentData?.sektorler_visibility as
    | string[]
    | undefined;

  const matchedRoutes = (routeKey: string): boolean => {
    // Eğer hiç tik seçilmediyse (undefined veya boş array) -> fallback: sektör ekranları aktif olsun
    if (!Array.isArray(sektorVisibility) || sektorVisibility.length === 0) return true;
    return sektorVisibility.includes(routeKey);
  };

  // routeKey -> (dokümandaki "sektorler index" / "sector detail" karşılıkları)
  const allowIndex = matchedRoutes('sektorler index');
  const allowDetail = matchedRoutes('sector detail');

  // Bu component hem index hem detail için kullanılabildiği için,
  // "tick" mantığına göre sektör kartlarını sadece izinli sayfalarda gösteriyoruz.
  const isAllowed = allowIndex || allowDetail;

  const activeCompatibleSectors = isAllowed
    ? sectorsData.filter(
        (sec: any) => sec.active && compatibleSlugs.includes(sec.slug),
      )
    : [];

  const aeoSummary = AiOverviewsHelper.buildAeoSummaryBlock({
    title: title || contentData.title || '',
    description: contentData.description || '',
    features: [],
  });

  const processedBody = ContextualLinker.injectLinks(
    AiOverviewsHelper.injectAiFriendlyMarkers(contentData.body || ''),
    sectorsData,
    servicesData,
    settings?.pseo_internal_linking !== false
  );

  return (
    <>
      <div className="sr-only" data-aeo="summary">{aeoSummary}</div>
      <ServicesSection 
        variant="full" 
        services={servicesData} 
        sectionContent={servicesSectionContent}
        badge={badge}
        title={title}
        subtitle={subtitle}
      />
      
      {contentData.body && (
        <div className="container-boxed max-w-[1100px] mx-auto px-4 md:px-6 py-16 prose prose-slate max-w-none">
          <div dangerouslySetInnerHTML={{ __html: processedBody }} className="text-black/70 text-lg leading-relaxed font-medium" />
        </div>
      )}

      {/* Sektör Kartları Bölümü */}
      {activeCompatibleSectors.length > 0 && (
        <div className="container-boxed max-w-[1100px] mx-auto px-4 md:px-6 pb-20">
          <div className="flex flex-col gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-blue-600" />
              <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.25em]">
                UYGULAMA ALANLARI
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-black italic tracking-tighter">
              Sektörlere Özel <span className="text-blue-600">Çözümler</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-semibold max-w-[700px]">
              Bu zemin çözümü, aşağıdaki endüstriyel ve ticari sektörlerde yüksek performans, iş güvenliği ve uzun ömürlü kullanım sunmaktadır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCompatibleSectors.map((sec) => {
              const IconComponent = (LucideIcons as any)[sec.icon || 'Shield'] || LucideIcons.Shield;
              return (
                <div 
                  key={sec.id} 
                  className="group bg-white border border-black/5 rounded-[24px] p-6 md:p-8 hover:border-blue-600/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/[0.01] group-hover:bg-blue-600/[0.03] rounded-full blur-2xl transition-all duration-500 -translate-y-1/2 translate-x-1/2" />
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/5 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 mb-6">
                    <IconComponent size={24} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-black mb-3 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                    {sec.name}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {sec.description || `${sec.name} tesislerinde zemin dayanıklılığını ve teknik uyumluluğu maksimum seviyeye çıkaran uygulama metodolojisi.`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
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
          settings={settings}
        />
      </div>

      {showFaq && faqs && faqs.length > 0 && (
        <FaqSection faqs={faqs} />
      )}
    </>
  );
}
