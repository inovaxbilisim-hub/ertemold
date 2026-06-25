import AboutSection from '@/modules/content/sections/AboutSection';
import ServicesSection from '@/modules/content/sections/ServicesSection';
import ReferencesSection from '@/modules/content/sections/ReferencesSection';
import { MapPin, Phone, Mail, Building2, Server, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import BlockRenderer from './BlockRenderer';

import { ServiceCategory } from '@/core/types';
import { replacePlaceholders } from '@/modules/settings/lib/ui-content';
import FaqSection from '@/modules/content/sections/FaqSection';

interface AboutTemplateProps {
  contentData: any;
  sectionContentData?: any;
  servicesData?: any[];
  categoriesData?: ServiceCategory[];
  referencesData?: any[];
  branchesData?: any[];
  statsData?: any[];
  heroData?: any;
  allPagesData?: any[];
  faqs?: any[];
  settings?: any;
}

export default function AboutTemplate({ 
  contentData, 
  sectionContentData,
  servicesData = [],
  categoriesData = [],
  referencesData = [],
  branchesData = [],
  statsData = [],
  heroData,
  allPagesData,
  faqs = [],
  settings: propSettings
}: AboutTemplateProps) {
  const settings = propSettings;
  const sectorName = settings?.sector || 'Kurumsal Hizmetler';
  
  // Apply dynamic placeholders to the content data
  const data = replacePlaceholders(contentData, { sector: sectorName });
  return (
    <div className="flex flex-col">
      {/* Core About Content (Mission, Vision, Values, Stats) */}
      <AboutSection 
        badge={contentData.badge}
        title={contentData.title}
        descriptionTop={contentData.descriptionTop || contentData.intro}
        descriptionBottom={contentData.descriptionBottom || contentData.body}
        imagePath={contentData.imagePath || contentData.image}
        imageSide={contentData.imageSide}
        milestones={contentData.milestones}
        missionTitle={contentData.missionTitle}
        missionDesc={data.missionDesc}
        visionTitle={data.visionTitle}
        visionDesc={data.visionDesc}
        valuesTitle={data.valuesTitle}
        values={data.values}
        ctaTitle={data.ctaTitle}
        ctaDesc={data.ctaDesc}
        ctaButtonText={data.ctaButtonText}
        ctaPhone={data.ctaPhone}
        images={data.images}
        contentData={data}
      />

      {/* Dynamic Services Summary */}
      {servicesData && servicesData.length > 0 && (
        <ServicesSection 
          services={servicesData} 
          variant="home"
          initialCategories={categoriesData}
          sectionContent={{
            sectionKey: 'services',
            badge: data.servicesBadge || sectionContentData?.services?.badge || '',
            title: data.servicesTitle || sectionContentData?.services?.title || '',
            subtitle: data.servicesSubtitle || sectionContentData?.services?.subtitle || '',
            content: sectionContentData?.services?.content || ''
          }}
        />
      )}

      {/* Dynamic References Carousel */}
      {referencesData && referencesData.length > 0 && (
        <ReferencesSection 
          data={referencesData} 
          variant="carousel"
          autoplaySpeed={3000}
          sectionContent={sectionContentData?.references}
        />
      )}

      {/* Dynamic Branches Section */}
      {branchesData && branchesData.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
          <div className="container-boxed relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-full px-5 py-2 mb-6 shadow-sm">
                <MapPin size={16} className="text-blue-600" />
                <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">
                  {data.branchesBadge || sectionContentData?.branches?.badge || ''}
                </span>
              </div>
              <h2 className="text-lg md:text-2xl font-black text-black mb-6 italic uppercase tracking-tighter">
                {data.branchesTitle || sectionContentData?.branches?.title || ''}
              </h2>
              <p className="text-black/40 text-lg md:text-xl font-black uppercase tracking-tight max-w-[700px] mx-auto leading-relaxed">
                {data.branchesSubtitle || sectionContentData?.branches?.subtitle || ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {branchesData.map((branch: any, idx: number) => (
                <div key={idx} className="bg-[#fbfcff] border border-black/5 rounded-[40px] p-10 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center mb-10 text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                    {branch.type === 'merkez' ? <Building2 size={32} /> : <Server size={32} />}
                  </div>
                  <h3 className="text-2xl font-black text-black mb-4 italic uppercase tracking-tight">{branch.title}</h3>
                  <div className="space-y-4 mb-10">
                    <div className="flex items-start gap-4 text-black/50">
                      <MapPin size={20} className="shrink-0 text-blue-600/50" />
                      <p className="text-[14px] font-bold leading-relaxed">{branch.address}</p>
                    </div>
                    {branch.phone && (
                      <div className="flex items-center gap-4 text-black/50">
                        <Phone size={20} className="shrink-0 text-blue-600/50" />
                        <p className="text-[14px] font-bold">{branch.phone}</p>
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center gap-4 text-black/50">
                        <Mail size={20} className="shrink-0 text-blue-600/50" />
                        <p className="text-[14px] font-bold">{branch.email}</p>
                      </div>
                    )}
                  </div>
                  <Link 
                    href="/iletisim" 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-black/5 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all group-hover:shadow-lg w-full justify-center"
                  >
                    {data.branchesCtaText || sectionContentData?.branches?.ctaText || 'İLETİŞİME GEÇ'} <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enriched Finale CTA (Optional if AboutSection CTA is enough) */}
      <section className="bg-black py-24 relative overflow-hidden text-center">
         <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            <h2 className="text-lg md:text-2xl font-black text-white mb-8 italic uppercase tracking-tighter leading-tight">
              {data.ctaBottomTitle || sectionContentData?.cta_bottom?.title || ''}
            </h2>
            <p className="text-white/40 text-base md:text-lg font-black uppercase tracking-widest mb-10 max-w-[600px] mx-auto leading-relaxed">
              {data.ctaBottomSubtitle || sectionContentData?.cta_bottom?.subtitle || ''}
            </p>
            <Link href="/iletisim" className="inline-flex items-center gap-4 px-12 py-5 bg-white text-black rounded-2xl text-[15px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-white/10 shadow-2xl">
              {data.ctaBottomButtonText || sectionContentData?.cta_bottom?.buttonText || 'BİZE ULAŞIN'} <ArrowRight size={20} />
            </Link>
          </div>
      </section>

      {/* Dynamic Blocks */}
      <div className="container-boxed max-w-[1100px] mx-auto px-4 md:px-6 py-24">
        <BlockRenderer 
          blocks={data.blocks}
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

      {settings?.faq_visibility?.includes('kurumsal') && faqs && faqs.length > 0 && (
        <div className="pb-24">
           <FaqSection faqs={faqs} />
        </div>
      )}
    </div>
  );
}
