import CloudinaryImage from '@/shared/components/CloudinaryImage';
import Link from 'next/link';
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';
import { HeroData, HeroUiContent } from '@/core/types';

interface MasonryHeroProps {
  data: HeroData;
  heroUi: HeroUiContent;
}

const fadeInClass = 'opacity-0 animate-fade-in';
const fadeInUpClass = 'opacity-0 animate-fade-in-up';

export default function MasonryHero({ data, heroUi }: MasonryHeroProps) {
  const activeHero = data?.active !== false ? data : null;
  
  const finalBadge = activeHero?.left?.badge || heroUi.fallbackBadge || '';
  const finalTitle = activeHero?.left?.title || heroUi.fallbackTitle || '';
  const finalDescription = activeHero?.left?.description || '';
  const finalCtaText = activeHero?.left?.ctaText || heroUi.fallbackCtaText || '';
  const finalCtaLink = activeHero?.left?.ctaLink || '/iletisim';
  const finalSecondaryCtaText = activeHero?.left?.ctaSecondaryText || heroUi.fallbackSecondaryCtaText || '';
  const finalSecondaryCtaLink = activeHero?.left?.ctaSecondaryLink || '/hizmetler';

  const items = (activeHero?.gallery || []).filter((item: any) => item?.path).slice(0, 4);
  const hasGallery = items.length > 0;
  const showStatusCard = Boolean(heroUi.statusBadge || heroUi.statusText);

  const isSingleGrid = items.length === 1;

  const gridCols = items.length === 1 ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden px-6 pt-[120px] pb-[60px] bg-white">
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-blue-600/[0.03] blur-[100px] rounded-full pointer-events-none animate-float" />
      <div className="absolute bottom-[5%] right-[5%] w-[600px] h-[600px] bg-teal/[0.04] blur-[120px] rounded-full pointer-events-none animate-float" />

      <div className="max-w-[1240px] mx-auto w-full relative z-20">
        <div className={`grid grid-cols-1 ${hasGallery ? (isSingleGrid ? 'lg:grid-cols-[0.8fr_1.2fr]' : 'lg:grid-cols-[1.2fr_0.8fr]') : 'lg:grid-cols-1'} gap-16 items-center`}>
          <div className={`relative z-40 ${fadeInUpClass}`}>
            {finalBadge && (
              <div className={`inline-flex items-center gap-3 border border-black/5 bg-black/[0.02] rounded-full px-5 py-2 mb-8 shadow-sm backdrop-blur-sm ${fadeInClass}`}>
                <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] animate-pulse" />
                <span className="text-black/60 text-[10px] font-black tracking-[0.3em] uppercase">{finalBadge}</span>
              </div>
            )}

            <h1 className={`text-lg md:text-xl lg:text-4xl xl:text-5xl font-black leading-[0.95] mb-8 text-black tracking-tighter italic uppercase ${fadeInClass}`}>
              {finalTitle}
            </h1>

            <p className={`text-black/40 text-lg md:text-xl font-black uppercase tracking-tight leading-tight mb-10 max-w-[540px] ${fadeInClass}`}>
              {finalDescription}
            </p>

            <div className={`flex flex-wrap gap-4 items-center ${fadeInClass}`}>
              {finalCtaText && (
                <Link href={finalCtaLink} className="inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-2xl text-[14px] font-black hover:bg-blue-600 hover:scale-105 transition-all duration-500 shadow-2xl uppercase tracking-widest">
                  {finalCtaText} <ArrowRight size={18} strokeWidth={3} />
                </Link>
              )}
              {finalSecondaryCtaText && (
                <Link href={finalSecondaryCtaLink} className="inline-flex items-center gap-3 px-10 py-5 bg-white border border-black/5 hover:border-blue-600/20 text-black/60 rounded-2xl text-[14px] font-black transition-all duration-500 uppercase tracking-widest">
                  <Play size={16} fill="currentColor" className="text-blue-600" /> {finalSecondaryCtaText}
                </Link>
              )}
            </div>
          </div>

          {hasGallery && (
            <div className={`relative h-full flex items-center ${isSingleGrid ? 'justify-center' : 'justify-center lg:justify-end'}`}>
              <div className={`grid ${gridCols} gap-5 relative z-10 w-full max-w-[500px] ${fadeInUpClass}`}>
                {items.map((item, index) => {
                  return (
                    <div
                      key={item.id || index}
                      className={`relative rounded-[40px] overflow-hidden border border-black/5 bg-white group shadow-2xl transition-all duration-700 ${isSingleGrid ? 'aspect-[4/3] lg:aspect-[16/10] w-full' : 'aspect-square'}`}
                    >
                      <div className="relative w-full h-full">
                        <CloudinaryImage
                          src={item.path}
                          alt={item.alt || finalTitle || 'Gallery image'}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
                          priority={isSingleGrid}
                          className="object-cover transition-all duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-transparent transition-colors duration-500" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {showStatusCard && (
                <div className={`absolute ${isSingleGrid ? '-bottom-6 -left-6' : '-top-6 -right-4 lg:-right-8'} px-8 py-5 bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/5 flex gap-4 items-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-30 ${fadeInClass}`}>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                      <ShieldCheck size={28} className="text-blue-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal rounded-full border-4 border-white animate-pulse shadow-lg shadow-teal/50" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-blue-600 tracking-[0.25em] uppercase leading-none mb-2">
                      {heroUi.statusBadge}
                    </span>
                    <span className="text-sm font-black text-black leading-none italic uppercase">
                      {heroUi.statusText}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
