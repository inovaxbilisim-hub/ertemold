'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import type { SectionContent, Service, ServiceCategory } from '@/core/types';
import CloudinaryImage from '@/shared/components/CloudinaryImage';
import { getCategoryColor } from '@/modules/settings/lib/category-config';


interface ServiceCardProps {
  item: Service;
  index: number;
  detailLabel: string;
  categoryName?: string;
}

const ServiceCard = React.memo(function ServiceCard({ item, index, detailLabel, categoryName }: ServiceCardProps) {
  // visual styles are derived from parent props; no local settings needed

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative h-[450px] rounded-[40px] overflow-hidden border border-black/5 bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 flex flex-col justify-end p-10"
    >
      {/* Background Image & Overlays */}
      <div className="absolute inset-0 z-0">
        {item.imagePath ? (
          <CloudinaryImage
            src={item.imagePath}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <Sparkles size={64} className="text-black/5" />
          </div>
        )}
        
        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
             <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
               {categoryName || item.slug} 
             </span>
          </div>
        </div>

        <div>
          <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-[0.95] mb-4 group-hover:text-blue-400 transition-colors">
            {item.title}
          </h3>
          
          <p className="text-white/60 text-[14px] font-bold uppercase leading-tight tracking-tight mb-8 line-clamp-3 group-hover:text-white/80 transition-colors">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {(item.features || []).slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="px-3 py-1 text-[9px] font-black tracking-[0.1em] rounded-lg border border-white/10 bg-white/5 text-white/60 uppercase backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>

          <Link
            href={`/hizmetler/${item.slug}`}
            className="inline-flex items-center gap-3 text-[13px] font-black tracking-[0.2em] uppercase text-white hover:gap-5 transition-all"
          >
            {detailLabel} <ArrowRight size={18} strokeWidth={3} className="text-blue-400" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
});

interface ServicesSectionProps {
  services: Service[];
  variant?: 'home' | 'full';
  category?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  sectionContent?: SectionContent;
  initialCategories?: ServiceCategory[];
}

export default function ServicesSection({
  services,
  variant = 'home',
  category,
  title,
  subtitle,
  badge,
  sectionContent,
  initialCategories = [],
}: ServicesSectionProps) {
  const { settings } = useSettings();
  const [categories, setCategories] = React.useState<ServiceCategory[]>(initialCategories);
  const servicesUi = settings?.uiContent?.servicesSection;

  React.useEffect(() => {
    if (initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  React.useEffect(() => {
    if (initialCategories.length > 0) return;

    fetch('/api/public/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data.filter((c: ServiceCategory) => c.active));
      })
      .catch(console.error);
  }, []);
  const allItems = Array.isArray(services) ? services : [];

  const finalBadge = badge || String(sectionContent?.badge || servicesUi?.badge || '');
  const finalTitle = title || String(sectionContent?.title || servicesUi?.title || '');
  const finalSubtitle = subtitle || String(sectionContent?.subtitle || servicesUi?.subtitle || '');

  const filteredCategories = category 
    ? categories.filter(c => c.slug === category || String(c.id) === category)
    : categories;

  const renderSection = (sectionTitle: string, description: string, items: Service[], catKey: string, href: string) => {
    const color = getCategoryColor(catKey);

    return (
      <div className="mb-24 last:mb-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative">
          <div className="space-y-4">
            <div className={`w-12 h-1 bg-${color} rounded-full`} />
            <h3 className="text-xl md:text-2xl font-black text-black italic uppercase tracking-tighter leading-none">
              {sectionTitle}
            </h3>
            <p className="text-black/40 text-[13px] font-black uppercase tracking-[0.2em]">{description}</p>
          </div>

          {variant === 'home' && (
            <Link
              href={href}
              className={`inline-flex items-center gap-4 text-[13px] font-black uppercase tracking-[0.3em] text-${color} hover:translate-x-2 transition-all group`}
            >
              {servicesUi?.viewAllLabel} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          )}
          <div className="absolute -bottom-4 left-0 w-full h-px bg-gradient-to-r from-black/5 via-black/[0.02] to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) =>
            item.active !== false ? <ServiceCard key={item.id} item={item} index={index} detailLabel={servicesUi?.detailLabel || ''} categoryName={sectionTitle} /> : null
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="hizmetler" className="py-20 md:py-24 px-6 bg-white relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        {!category && (
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-black/5 bg-black/[0.02] mb-8 shadow-sm"
            >
              <Zap size={16} className="text-blue-600" />
              <span className="text-black/60 text-[11px] font-black uppercase tracking-[0.4em]">{finalBadge}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl font-black text-black leading-tight tracking-tighter italic uppercase mb-8"
            >
              {finalTitle}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-black/40 font-black uppercase tracking-tight max-w-[700px] mx-auto leading-relaxed"
            >
              {finalSubtitle}
            </motion.p>
          </div>
        )}

        {filteredCategories.map(cat => {
          const catItems = allItems.filter(s => s.category_id === cat.id);
          const displayItems = variant === 'home' ? catItems.slice(0, 3) : catItems;
          
          if (displayItems.length === 0) return null;

          return (
            <React.Fragment key={cat.id}>
              {renderSection(cat.name, cat.description, displayItems, cat.slug, `/${cat.slug}`)}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
