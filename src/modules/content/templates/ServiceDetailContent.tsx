'use client';

import React from 'react';
import Link from 'next/link';
import CloudinaryImage from '@/shared/components/CloudinaryImage';
import {
  CheckCircle2,
  Phone,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Breadcrumbs from '@/shared/layout/Breadcrumbs';
import PhoneLink from '@/shared/layout/PhoneLink';
import { toTurkishTitleCase } from '@/modules/seo/lib/service-utils';
import { Service, FAQ } from '@/core/types';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import ServiceAreasSection from '@/modules/content/sections/ServiceAreasSection';
import FaqSection from '@/modules/content/sections/FaqSection';
import type { CityReference } from '@/lib/data-pseo';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { CONTENT_BEFORE_RENDER } from '@/core/hooks/hooks';
import { AiOverviewsHelper } from '@/domains/seo-engine/aeo/AiOverviewsHelper';
import ServiceCalculatorBlock from '@/modules/content/components/ServiceCalculatorBlock';
import CalculatorCTAButton from '@/modules/content/components/CalculatorCTAButton';

interface LocalServicePageProps {
  service: Service;
  category: string;
  cities: CityReference[];
  faqs?: FAQ[];
  siteUrl?: string;
  serviceReferences?: CityReference[];
  injectedSections?: Record<string, any>;
}

export default function ServiceDetailContent({ service, category, cities, faqs, siteUrl, serviceReferences, injectedSections: injectedSectionsProp }: LocalServicePageProps) {
  const { settings } = useSettings();
  const serviceUi = settings?.uiContent?.serviceDetail;

  React.useEffect(() => {
    HookRegistry.doAction(CONTENT_BEFORE_RENDER, { template: 'ServiceDetailContent', service, category, settings });
  }, [service, category, settings]);

  // Server-side injected sections (passed as prop from page.tsx)
  const injectedSections = injectedSectionsProp || {};

  const calculatorSection = injectedSections.calculator as {
    enabled?: boolean;
    showCTA?: boolean;
    ctaButtonText?: string;
    ctaButtonIcon?: 'Calculator' | 'ArrowRight' | 'DollarSign' | 'none';
  } | null;
  const sectionVisibility = settings?.sectionVisibility?.serviceDetail;
  const currentCategoryLabel = toTurkishTitleCase(category);
  const phoneVal = settings?.phone || '';
  const phoneClean = phoneVal.replace(/\s/g, '');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-24 pb-16 px-4">
      <div className="container-boxed bg-white relative">
        <div className="absolute top-0 inset-x-0 h-[200px] bg-gradient-to-b from-black/[0.02] to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/[0.03] blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

        <section className="relative z-10 p-6 md:p-12 border-b border-[var(--border-subtle)]">
        {sectionVisibility?.hero !== false ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
              <motion.div variants={itemVariants} className="mb-10">
                <Breadcrumbs 
                  siteUrl={siteUrl}
                  crumbs={[{ label: 'Hizmetler', href: '/#hizmetler' }, { label: service.title }]} 
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
                <div className="w-10 h-[2px] bg-blue-600" />
                <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">
                  {currentCategoryLabel}
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-xl md:text-2xl font-black text-black mb-8 italic uppercase tracking-tighter leading-[0.95]">
                {service.title.split(' ').map((word, index) => (
                  <span key={`${word}-${index}`} className="inline-block">
                    {index === service.title.split(' ').length - 1 ? <span className="text-blue-600">{word}</span> : word}&nbsp;
                  </span>
                ))}
              </motion.h1>

              <motion.p variants={itemVariants} className="text-black/40 text-lg md:text-2xl font-black uppercase tracking-tight max-w-[580px] mb-12 leading-tight">
                {service.description}
              </motion.p>

              <motion.div variants={itemVariants}>
                <PhoneLink phone={phoneVal} href={`tel:${phoneClean}`} source="service-detail-hero" className="inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-2xl text-[14px] font-black transition-all duration-500 hover:bg-blue-600 hover:scale-105 shadow-2xl uppercase tracking-widest">
                  <Phone size={20} strokeWidth={3} /> {serviceUi?.primaryCtaText}
                </PhoneLink>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-[40px] overflow-hidden border border-black/5 shadow-2xl relative aspect-square group">
                <CloudinaryImage
                  src={service.imagePath}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  className="object-cover transition-all duration-1000 group-hover:scale-110"
                  priority
                  fetchPriority="high"
                  fallbackSrc=""
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              <div className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-2xl border border-black/5 p-8 rounded-[32px] shadow-2xl flex items-center gap-5 z-20">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-black font-black text-lg italic uppercase leading-none mb-2">{serviceUi?.supportTitle}</div>
                  <div className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em]">{serviceUi?.supportSubtitle}</div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
        </section>

        <section className="p-6 md:p-12 relative bg-[#fbfcff]/50">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.6fr] gap-8 md:gap-12 items-start">
            {sectionVisibility?.content !== false ? (
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3">
                  <Star size={28} className="text-[var(--accent-teal)]" fill="currentColor" /> {serviceUi?.approachTitle}
                </h2>
                <div
                  className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: AiOverviewsHelper.injectAiFriendlyMarkers(service.longDescription || service.description || '') }}
                />
              </motion.div>
            ) : <div />}

            {(sectionVisibility?.features !== false || sectionVisibility?.trust !== false) ? (
            <aside className="lg:sticky lg:top-32">
              <div className="bg-white border border-black/5 rounded-[40px] p-10 shadow-xl">
                {sectionVisibility?.features !== false ? (
                  <>
                    <h3 className="text-xl font-black text-black mb-10 italic uppercase tracking-widest">{serviceUi?.featuresTitle}</h3>
                    <div className={`flex flex-col gap-6 ${sectionVisibility?.trust !== false ? 'mb-12' : ''}`}>
                      {service.features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4"
                        >
                          <div className="p-2 bg-blue-600/5 rounded-xl border border-blue-600/10 shrink-0">
                            <CheckCircle2 size={18} className="text-blue-600" strokeWidth={3} />
                          </div>
                          <span className="text-black/60 font-black uppercase text-sm tracking-tight">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : null}

                {sectionVisibility?.trust !== false ? (
                  <div className="p-8 bg-[#fbfcff] rounded-[28px] border border-black/5">
                    <div className="flex items-center gap-4 mb-4">
                      <Clock size={20} className="text-blue-600" />
                      <span className="font-black text-black italic uppercase text-sm">{serviceUi?.trustTitle}</span>
                    </div>
                    <p className="text-[12px] text-black/40 font-bold uppercase leading-relaxed tracking-wide">
                      {serviceUi?.trustDescription}
                    </p>
                  </div>
                ) : null}
              </div>
            </aside>
            ) : null}
          </div>
        </section>

        {calculatorSection?.enabled ? (
          <section className="py-12 px-6 md:px-12 bg-white border-y border-[var(--border-subtle)]">
            <div className="container-boxed">
              <ServiceCalculatorBlock
                service={service}
                pageType="service"
                settings={settings}
              />
            </div>
          </section>
        ) : calculatorSection?.showCTA ? (
          <section className="px-6 md:px-12 bg-white border-y border-[var(--border-subtle)]">
            <CalculatorCTAButton
              serviceSlug={service.slug}
              buttonText={calculatorSection.ctaButtonText}
              icon={calculatorSection.ctaButtonIcon}
            />
          </section>
        ) : null}

        {/* FAQ Section Integrated into Boxed Container */}
        {settings?.faq_visibility?.includes('services') && faqs && faqs.length > 0 && (
          <div className="border-t border-[var(--border-subtle)]">
            <FaqSection faqs={faqs} />
          </div>
        )}

        {/* B3: Bu hizmeti gerçekleştirdiğimiz iller (references tablosundan) */}
        {serviceReferences && serviceReferences.length > 0 && (
          <section className="px-6 md:px-12 py-10 border-t border-[var(--border-subtle)]">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-[2px] bg-blue-600" />
                  <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Lokal Deneyim</span>
                </div>
                <h3 className="text-lg font-black text-black italic tracking-tight">
                  Bu Hizmeti Gerçekleştirdiğimiz <span className="text-blue-600">İller</span>
                </h3>
              </div>
              <Link
                href="/referanslar"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black text-black/40 hover:text-blue-600 transition-colors uppercase tracking-widest"
              >
                Tüm Referanslar <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Benzersiz şehirleri göster */}
              {Array.from(
                new Map(serviceReferences.map(r => [r.city_slug, r])).values()
              ).map((ref) => (
                <Link
                  key={ref.city_slug}
                  href={`/hizmetler/${service.slug}/${ref.city_slug}`}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-black/5 rounded-2xl hover:border-blue-600/20 hover:shadow-md transition-all"
                >
                  <MapPin size={13} className="text-blue-600" />
                  <span className="text-[12px] font-black text-black/70 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {ref.city_name || toTurkishTitleCase(ref.city_slug || '')}
                  </span>
                  {ref.sector && (
                    <span className="text-[9px] text-black/30 font-bold bg-black/[0.03] px-2 py-0.5 rounded-full">
                      {ref.sector}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic pSEO Service Areas Section */}
        {sectionVisibility?.locations !== false && (
          <ServiceAreasSection 
            pseoMode={settings?.pseo_mode || 'off'} 
            serviceSlug={service.slug} 
            cities={cities.map(c => ({ id: c.id, name: (c as any).name || (c as any).title, slug: c.slug }))}
            title={serviceUi?.servicesTitle}
          />
        )}
      </div>
    </div>

  );
}
