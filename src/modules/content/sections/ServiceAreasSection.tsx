'use client';

import Link from 'next/link';
import { MapPin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { toTurkishTitleCase } from '@/modules/seo/lib/service-utils';

interface City {
  id?: number;
  name: string;
  slug?: string;
}

interface ServiceAreasSectionProps {
  pseoMode: 'off' | 'branch_based' | 'country_based';
  serviceSlug: string;
  currentCitySlug?: string;
  cities: City[];
  title?: string;
  description?: string;
}

export default function ServiceAreasSection({
  pseoMode,
  serviceSlug,
  cities,
  title,
  description
}: ServiceAreasSectionProps) {
  if (pseoMode === 'off') return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="hizmet-bolgeleri" className="py-20 px-4 bg-[#f8f9fa] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/[0.02] blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-600/[0.02] blur-[100px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="container-boxed relative z-10">
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-6 bg-white border border-black/5 text-blue-600 shadow-sm"
          >
            <Globe size={14} strokeWidth={3} />
            Tüm Türkiye Hizmet Ağı
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-black mb-8 italic tracking-tighter leading-[0.95] uppercase"
          >
            {title || 'Geniş Hizmet Kapasitemizle Yanınızdayız'}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-black/40 text-lg md:text-xl font-black tracking-tight leading-tight uppercase"
          >
            {description || 'Türkiye genelinde tüm il ve ilçelerde uzman kadromuzla yanınızdayız.'}
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6"
        >
          {cities.map((city, index) => (
              <motion.div key={city.id || city.slug || `${city.name}-${index}`} variants={itemVariants}>
                <Link 
                  href={`/hizmetler/${serviceSlug}/${city.slug}`}
                  prefetch={false}
                  className="group block h-full bg-white border border-black/5 rounded-[24px] p-6 transition-all duration-500 hover:border-blue-600/20 hover:shadow-2xl hover:scale-[1.03] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/[0.02] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-colors duration-500" />
                  
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-black/5 flex items-center justify-center text-black/20 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500">
                      <MapPin size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-tight leading-none mb-2">
                        {toTurkishTitleCase(city.name)}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
