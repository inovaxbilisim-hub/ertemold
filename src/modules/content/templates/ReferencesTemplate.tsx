import ReferencesSection from '@/modules/content/sections/ReferencesSection';
// types unused in this template
import { motion } from 'framer-motion';
import { Shield, Users, Award, Zap, Target, HeartHandshake, CheckCircle2 } from 'lucide-react';

const iconMap: Record<string, any> = {
  Shield, Users, Award, Zap, Target, HeartHandshake, CheckCircle2
};

import BlockRenderer from './BlockRenderer';
import FaqSection from '@/modules/content/sections/FaqSection';

interface ReferencesTemplateProps {
  contentData: any;
  referencesData: any[];
  sectionContentData: any;
  servicesData?: any[];
  statsData?: any[];
  heroData?: any;
  branchesData?: any[];
  categoriesData?: any[];
  allPagesData?: any[];
  faqs?: any[];
  settings?: any;
}

export default function ReferencesTemplate({ 
  contentData, 
  referencesData, 
  sectionContentData,
  servicesData,
  statsData,
  heroData,
  branchesData,
  categoriesData,
  allPagesData,
  faqs = [],
  settings
}: ReferencesTemplateProps) {
  const values = contentData?.values || [];
  const valuesTitle = contentData?.valuesTitle || 'Kurumsal Değerlerimiz';

  return (
    <div className="flex flex-col">
      <ReferencesSection 
        variant="grid"
        data={referencesData} 
        sectionContent={sectionContentData} 
        badge={contentData.badge}
        title={contentData.title}
        subtitle={contentData.subtitle}
      />

      {/* Dynamic Values Grid (Admin'den yönetilebilir Kurumsal Değerler) */}
      {values.length > 0 && (
        <section className="py-20 px-6 bg-[#fbfcff] relative">
          <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
          <div className="max-w-[1240px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-lg md:text-2xl font-black text-black italic uppercase tracking-tighter"
              >
                {valuesTitle}
              </motion.h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-teal mx-auto mt-4 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((v: any, idx: number) => {
                const Icon = iconMap[v.iconName] || Shield;
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-10 rounded-[50px] border border-black/5 shadow-md hover:shadow-2xl transition-all duration-500 group relative overflow-hidden h-full"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#fbfcff] border border-black/5 flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-black text-black mb-4 italic uppercase tracking-tight leading-tight">
                      {v.title}
                    </h3>
                    <p className="text-black/40 text-[13px] font-bold uppercase leading-relaxed tracking-tight group-hover:text-black/60 transition-colors">
                      {v.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Blocks */}
      <div className="container-boxed max-w-[1100px] mx-auto px-4 md:px-6 py-12">
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

      {settings?.faq_visibility?.includes('references') && faqs && faqs.length > 0 && (
        <div className="pb-24">
           <FaqSection faqs={faqs} />
        </div>
      )}
    </div>
  );
}
