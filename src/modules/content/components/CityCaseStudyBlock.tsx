/**
 * City Case Study Block
 *
 * Phase 3 - B3: Case Study Blocks
 *
 * Displays mini project stories in a visually engaging format:
 * Context → Challenge → Solution → Result
 *
 * Shows only real project data — no fabricated content.
 */

import Link from 'next/link';
import { ArrowRight, Layers, Maximize2, Calendar, AlertCircle, Lightbulb, CheckCircle } from 'lucide-react';
import type { CaseStudy } from '@/modules/ai/lib/city-case-studies';

interface CityCaseStudyBlockProps {
  caseStudies: CaseStudy[];
  cityName: string;
  serviceTitle: string;
  className?: string;
}

const SECTOR_COLORS: Record<string, string> = {
  default: 'bg-blue-600/5 border-blue-600/20 text-blue-700',
  gıda: 'bg-emerald-600/5 border-emerald-600/20 text-emerald-700',
  otomotiv: 'bg-slate-600/5 border-slate-600/20 text-slate-700',
  lojistik: 'bg-amber-600/5 border-amber-600/20 text-amber-700',
  tekstil: 'bg-purple-600/5 border-purple-600/20 text-purple-700',
  kimya: 'bg-red-600/5 border-red-600/20 text-red-700',
};

function getSectorBadgeColor(sector: string | null): string {
  if (!sector) return SECTOR_COLORS.default;
  const key = Object.keys(SECTOR_COLORS).find(k => sector.toLowerCase().includes(k));
  return key ? SECTOR_COLORS[key] : SECTOR_COLORS.default;
}

export default function CityCaseStudyBlock({
  caseStudies,
  cityName,
  serviceTitle,
  className = '',
}: CityCaseStudyBlockProps) {
  if (!caseStudies || caseStudies.length === 0) return null;

  return (
    <section
      className={`city-case-studies border-t border-black/5 py-12 md:py-16 ${className}`}
      aria-label={`${cityName} proje vaka çalışmaları`}
    >
      {/* Başlık */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-[2px] bg-blue-600" />
          <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
            Proje Deneyimi
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-black italic tracking-tight leading-tight">
          {cityName}&apos;da{' '}
          <span className="text-blue-600">Tamamlanan Projelerden</span>
        </h2>
        <p className="text-black/40 text-sm font-semibold mt-2 max-w-[560px] leading-relaxed">
          Aşağıdaki vaka çalışmaları, {cityName} ilinde gerçekleştirdiğimiz {serviceTitle.toLowerCase()} projelerinden
          derlenen gerçek deneyimlere dayanmaktadır.
        </p>
      </div>

      {/* Kart Listesi */}
      <div className="space-y-6">
        {caseStudies.map((cs, index) => (
          <article
            key={cs.id}
            className="bg-white border border-black/5 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {/* Kart Başlığı */}
            <div className="p-6 md:p-8 border-b border-black/5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {/* Proje sırası */}
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Sektör badge */}
                    {cs.sector && (
                      <span className={`inline-block px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${getSectorBadgeColor(cs.sector)}`}>
                        {cs.sector}
                      </span>
                    )}

                    {/* Sistem badge */}
                    {cs.systemType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-bold">
                        <Layers size={9} />
                        {cs.systemType}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base md:text-lg font-black text-black italic tracking-tight leading-tight">
                    {cs.storyTitle}
                  </h3>
                </div>

                {/* Proje metrikleri */}
                <div className="flex items-center gap-3 shrink-0">
                  {cs.projectSize && cs.projectSize > 0 && (
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Maximize2 size={12} />
                        <span className="text-sm font-black text-slate-800">
                          {cs.projectSize.toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">m²</div>
                    </div>
                  )}
                  {cs.projectDate && (
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Calendar size={12} />
                        <span className="text-sm font-black text-slate-800">
                          {new Date(cs.projectDate).getFullYear()}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">Yıl</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* İçerik Grid */}
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/5">
              {/* Zorluk */}
              {cs.storyChallenge && (
                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-red-50 rounded-lg">
                      <AlertCircle size={13} className="text-red-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Zorluk
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {cs.storyChallenge}
                  </p>
                </div>
              )}

              {/* Çözüm */}
              {cs.storySolution && (
                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <Lightbulb size={13} className="text-blue-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Çözüm
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {cs.storySolution}
                  </p>
                </div>
              )}

              {/* Sonuç */}
              {cs.storyResult && (
                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                      <CheckCircle size={13} className="text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Sonuç
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {cs.storyResult}
                  </p>
                </div>
              )}
            </div>

            {/* Referans linki */}
            <div className="px-6 md:px-8 py-4 bg-slate-50/50 border-t border-black/5">
              <Link
                href={`/referanslar/${cs.referenceSlug}`}
                className="inline-flex items-center gap-2 text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider transition-colors"
              >
                Projeyi İncele
                <ArrowRight size={12} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Kaynak notu */}
      <p className="mt-6 text-[10px] text-slate-400 text-center font-medium">
        💼 Bu vaka çalışmaları, gerçek proje verilerimizden derlenmiştir
      </p>
    </section>
  );
}
