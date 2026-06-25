'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Building2, Star, ChevronLeft, ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CloudinaryImage from '@/shared/components/CloudinaryImage';

import { Reference } from '@/core/types';
import { useSettings } from '@/modules/settings/context/SettingsContext';

interface ReferenceProps {
  data: Reference[];
  title?: string;
  badge?: string;
  subtitle?: string;
  variant?: 'carousel' | 'grid';
  autoplaySpeed?: number;
  showArrows?: boolean;
  pauseOnHover?: boolean;
  sectionContent?: any;
}

const ReferenceCard = React.memo(function ReferenceCard({ refData, refUi }: { refData: Reference, refUi: any }) {
  return (
    <article className="bg-[#fbfcff] border border-black/5 rounded-[40px] p-8 md:p-10 h-full flex flex-col transition-all duration-500 shadow-lg hover:border-blue-600/20 hover:bg-white hover:shadow-2xl premium-shadow group relative overflow-hidden">
      <div className="relative w-full h-[180px] bg-white rounded-3xl flex items-center justify-center p-12 mb-8 border border-black/5 shadow-inner transition-all group-hover:shadow-lg overflow-hidden">
        {refData.logoPath ? (
          <CloudinaryImage
            src={refData.logoPath}
            alt={`${refData.name} Logo`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            loading="lazy"
            className="object-contain p-8 opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 pointer-events-none scale-90 group-hover:scale-100"
          />
        ) : (
          <Building2 size={56} className="text-black/5" />
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="text-[17px] md:text-[19px] font-black text-black m-0 leading-tight italic uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
          {refData.name}
        </h3>
        <div className="inline-flex items-center gap-2 mt-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(0,102,204,0.3)]" />
            <p className="text-black/50 text-[10px] font-black uppercase tracking-[0.25em]">
              {refData.sector}
            </p>
        </div>
        
        <div className="border-t border-black/5 pt-6 mt-auto">
          {refData.description && (
            <p className="text-black/50 text-[13px] font-medium leading-relaxed mb-4 line-clamp-2 group-hover:text-black/70 transition-colors">
              {refData.description}
            </p>
          )}
          {(Array.isArray(refData.features) && refData.features.length > 0) && (
            <ul className="flex flex-col gap-2 m-0 p-0">
              {refData.features.slice(0, 3).map((feat, idx) => (
                <li key={idx} className="text-black/60 text-[12px] font-bold flex items-start gap-2 uppercase tracking-wide">
                  <span className="text-blue-600 mt-0.5 text-[14px] leading-none">•</span>
                  <span className="line-clamp-1">{feat}</span>
                </li>
              ))}
              {refData.features.length > 3 && (
                <li className="text-blue-600 text-[11px] font-black uppercase tracking-widest mt-1">
                  + {refData.features.length - 3} {refUi?.moreFeaturesSuffix || 'İŞLEM DAHA'}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
});

export default function ReferencesSection({
  data,
  title,
  subtitle,
  badge,
  variant = 'carousel',
  autoplaySpeed = 3000,
  showArrows = true,
  pauseOnHover = true,
  sectionContent,
}: ReferenceProps) {
  const references = Array.isArray(data) ? data.filter(r => r.active !== false) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { settings } = useSettings();
  const refUi = settings?.uiContent?.referencesSection;

  const finalBadge = badge || sectionContent?.badge || refUi?.badge || 'BAŞARI GÖSTERGELERİ';
  const finalTitle = title || sectionContent?.title || refUi?.title || 'Güveni Referansla İnşa Ediyoruz.';
  const finalSubtitle = subtitle || sectionContent?.subtitle || refUi?.subtitle || 'Farklı endüstrilerden yüzlerce global ve yerel kurumun başarı yolculuğuna eşlik ettik.';

  // Responsive items count for carousel
  useEffect(() => {
    setMounted(true);
    if (variant === 'grid') return;
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else if (window.innerWidth < 1280) setItemsPerView(3);
      else setItemsPerView(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [variant]);

  const activeItemsPerView = mounted ? itemsPerView : 4;
  const totalPages = Math.max(0, references.length - activeItemsPerView + 1);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= totalPages - 1 ? 0 : prev + 1));
  }, [totalPages]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const pauseAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resumeAutoplay = useCallback(() => {
    if (autoplaySpeed > 0) {
      pauseAutoplay();
      timerRef.current = setInterval(nextSlide, autoplaySpeed);
    }
  }, [autoplaySpeed, nextSlide, pauseAutoplay]);

  useEffect(() => {
    if (variant === 'carousel' && autoplaySpeed > 0) {
      timerRef.current = setInterval(nextSlide, autoplaySpeed);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, autoplaySpeed, variant]);

  if (references.length === 0) return null;


  // RENDER GRID VARIANT
  if (variant === 'grid') {
    return (
      <main className="bg-white min-h-screen pt-32 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-6 relative z-10">
          <section className="text-left md:text-center mb-24">
            <div className="inline-flex items-center gap-2 border border-black/5 bg-black/[0.02] rounded-full px-5 py-2 mb-8 shadow-sm">
              <Star size={14} className="text-blue-600 fill-blue-600/20" />
              <span className="text-black/60 text-[10px] font-black tracking-[0.3em] uppercase">{finalBadge}</span>
            </div>
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-black mb-8 leading-tight italic uppercase">
              {finalTitle.includes(' ') ? (
                <>
                  {finalTitle.split(' ').slice(0, -1).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal pr-2">{finalTitle.split(' ').slice(-1)}</span>
                </>
              ) : finalTitle}
            </h1>
            <p className="text-black/40 text-base md:text-lg leading-relaxed max-w-[700px] mx-auto font-black uppercase tracking-tight">
              {finalSubtitle}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {references.map((ref) => (
              <div key={ref.id}><ReferenceCard refData={ref} refUi={refUi} /></div>
            ))}
          </div>

          {(sectionContent?.cta_bottom_title || sectionContent?.cta_bottom_subtitle) && (
            <section className="mt-32">
              <div className="max-w-[1240px] mx-auto bg-black rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 grid-pattern opacity-[0.1] contrast-200" />
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-teal" />
                <h2 className="text-lg md:text-2xl font-black text-white tracking-tighter mb-8 relative z-10 leading-tight italic uppercase">
                  {sectionContent?.cta_bottom_title}
                </h2>
                <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto mb-10 font-black uppercase tracking-tight relative z-10">
                  {sectionContent?.cta_bottom_subtitle}
                </p>
                {sectionContent?.cta_bottom_btn_text && (
                  <Link href={sectionContent?.cta_bottom_btn_link || "/iletisim"} className="inline-flex items-center gap-3 px-14 py-6 bg-white text-black rounded-2xl text-[18px] font-black hover:scale-105 transition-all shadow-white/10 shadow-xl relative z-10 uppercase tracking-widest">
                    {sectionContent?.cta_bottom_btn_text} <ArrowRight size={22} />
                  </Link>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    );
  }

  // RENDER CAROUSEL VARIANT (DEFAULT)
  return (
    <section id="referanslar" className="py-16 md:py-20 px-6 bg-[#fbfcff] overflow-hidden">
      <div className="container-boxed bg-white p-10 md:p-20">
        <div className="text-center mb-24">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-3 bg-black/[0.02] border border-black/5 rounded-full px-5 py-2 mb-10 shadow-sm">
            <Star size={16} className="text-blue-600" />
            <span className="text-black/60 text-[11px] font-black uppercase tracking-[0.3em]">{finalBadge}</span>
          </motion.div>
          <h2 className="text-lg md:text-2xl font-black text-black mb-6 italic uppercase tracking-tighter leading-tight">
            {finalTitle}
          </h2>
          <p className="text-black/40 text-base md:text-lg font-black uppercase tracking-tight max-w-[700px] mx-auto leading-relaxed">
            {finalSubtitle}
          </p>
        </div>

        <div className="relative px-4" onMouseEnter={pauseOnHover ? pauseAutoplay : undefined} onMouseLeave={pauseOnHover ? resumeAutoplay : undefined}>
          <div className="overflow-hidden -mx-4 pb-12">
            <motion.div 
              initial={false}
              animate={{ x: mounted ? `-${currentIndex * (100 / itemsPerView)}%` : '0%' }} 
              transition={{ type: "spring", stiffness: 300, damping: 35 }} 
              className="flex"
            >
              {references.map((ref) => (
                <div 
                  key={ref.id} 
                  className="px-4 shrink-0 box-border w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
                >
                  <ReferenceCard refData={ref} refUi={refUi} />
                </div>
              ))}
            </motion.div>
          </div>

          {showArrows && totalPages > 1 && (
            <>
              <button onClick={prevSlide} className="absolute top-1/2 -left-8 -translate-y-1/2 w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-black shadow-2xl z-10 transition-all hover:scale-110 active:scale-95 group overflow-hidden">
                <ChevronLeft size={28} strokeWidth={3} />
              </button>
              <button onClick={nextSlide} className="absolute top-1/2 -right-8 -translate-y-1/2 w-16 h-16 rounded-2xl bg-black border border-black/5 flex items-center justify-center text-white shadow-2xl z-10 transition-all hover:scale-110 active:scale-95 group">
                <ChevronRight size={28} strokeWidth={3} />
              </button>
            </>
          )}
        </div>
        
        {(sectionContent?.view_all_btn_text || refUi?.viewAllLabel) && (
          <div className="text-center mt-20">
            <Link href={sectionContent?.view_all_btn_link || "/referanslar"} className="inline-flex items-center gap-3 py-6 px-14 bg-gray-50 border border-black/5 text-black font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl hover:bg-black hover:text-white hover:-translate-y-1 transition-all duration-500">
              {sectionContent?.view_all_btn_text || refUi?.viewAllLabel} <ArrowRight size={20} strokeWidth={3} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
