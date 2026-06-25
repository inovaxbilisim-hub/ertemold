/**
 * City Reference Highlights
 * 
 * Phase 3 - B2: Enhanced Reference Highlighting
 * 
 * Groups city references by sector, shows logos, badges and trust signals.
 * Adds significant E-E-A-T value through real project evidence.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Factory,
  UtensilsCrossed,
  Truck,
  Shirt,
  FlaskConical,
  Heart,
  Zap,
  HardHat,
  ShoppingBag,
  Layers,
  Calendar,
  Maximize2,
  Award,
} from 'lucide-react';
import type { CityReference } from '@/lib/data-pseo';

interface CityReferenceHighlightsProps {
  references: CityReference[];
  cityName: string;
  serviceName?: string;
  viewAllHref?: string;
}

// Sektör → ikon eşlemesi
const SECTOR_ICONS: Record<string, React.ReactNode> = {
  'otomotiv': <Factory size={16} className="text-blue-600" />,
  'gıda': <UtensilsCrossed size={16} className="text-emerald-600" />,
  'lojistik': <Truck size={16} className="text-amber-600" />,
  'depo': <Truck size={16} className="text-amber-600" />,
  'tekstil': <Shirt size={16} className="text-purple-600" />,
  'kimya': <FlaskConical size={16} className="text-red-600" />,
  'kimyasal': <FlaskConical size={16} className="text-red-600" />,
  'ilaç': <Heart size={16} className="text-pink-600" />,
  'sağlık': <Heart size={16} className="text-pink-600" />,
  'elektronik': <Zap size={16} className="text-yellow-600" />,
  'inşaat': <HardHat size={16} className="text-orange-600" />,
  'ticaret': <ShoppingBag size={16} className="text-indigo-600" />,
};

function getSectorIcon(sector: string | null): React.ReactNode {
  if (!sector) return <Building2 size={16} className="text-slate-400" />;
  const key = Object.keys(SECTOR_ICONS).find(k =>
    sector.toLowerCase().includes(k)
  );
  return key ? SECTOR_ICONS[key] : <Building2 size={16} className="text-slate-400" />;
}

// Sektöre göre accent rengi
function getSectorColor(sector: string | null): string {
  if (!sector) return 'bg-slate-50 border-slate-200 text-slate-700';
  const s = sector.toLowerCase();
  if (s.includes('otomotiv')) return 'bg-blue-50 border-blue-200 text-blue-800';
  if (s.includes('gıda')) return 'bg-emerald-50 border-emerald-200 text-emerald-800';
  if (s.includes('lojistik') || s.includes('depo')) return 'bg-amber-50 border-amber-200 text-amber-800';
  if (s.includes('tekstil')) return 'bg-purple-50 border-purple-200 text-purple-800';
  if (s.includes('kimya')) return 'bg-red-50 border-red-200 text-red-800';
  if (s.includes('ilaç') || s.includes('sağlık')) return 'bg-pink-50 border-pink-200 text-pink-800';
  if (s.includes('elektronik')) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  return 'bg-slate-50 border-slate-100 text-slate-700';
}

interface SectorGroup {
  sector: string;
  count: number;
  totalSqm: number;
  references: CityReference[];
}

function groupBySector(references: CityReference[]): SectorGroup[] {
  const map = new Map<string, CityReference[]>();

  for (const ref of references) {
    const key = ref.sector || 'Diğer';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ref);
  }

  return Array.from(map.entries())
    .map(([sector, refs]) => ({
      sector,
      count: refs.length,
      totalSqm: refs.reduce((sum, r) => sum + (r.project_size || 0), 0),
      references: refs,
    }))
    .sort((a, b) => b.count - a.count);
}

// Aggregate stats
function computeStats(references: CityReference[]) {
  const totalProjects = references.length;
  const totalSqm = references.reduce((sum, r) => sum + (r.project_size || 0), 0);
  const uniqueSectors = new Set(references.map(r => r.sector).filter(Boolean)).size;
  const latestYear = references
    .map(r => r.project_date ? new Date(r.project_date).getFullYear() : null)
    .filter(Boolean)
    .sort((a, b) => b! - a!)
    [0];
  return { totalProjects, totalSqm, uniqueSectors, latestYear };
}

export default function CityReferenceHighlights({
  references,
  cityName,
  serviceName,
  viewAllHref = '/referanslar',
}: CityReferenceHighlightsProps) {
  if (!references || references.length === 0) return null;

  const sectorGroups = groupBySector(references);
  const stats = computeStats(references);

  return (
    <section
      id="sehir-referans-highlights"
      className="border-t border-black/5 py-12 md:py-16 relative z-10"
      aria-label={`${cityName} bölgesindeki referanslarımız`}
    >
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-[2px] bg-blue-600" />
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
              Güvenilir Referanslar
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-black italic tracking-tight leading-tight">
            {cityName}&apos;da{' '}
            <span className="text-blue-600">Güvenilen Markalar</span>
          </h2>
          <p className="text-black/40 text-sm font-semibold mt-2 max-w-[520px] leading-relaxed">
            {cityName} ilinde gerçekleştirdiğimiz projeler; deneyimimizi ve bölgesel uzmanlığımızı kanıtlar.
          </p>
        </div>

        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-black/40 hover:text-blue-600 transition-colors shrink-0"
        >
          Tüm Referanslar
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Aggregate İstatistikler */}
      {stats.totalProjects >= 2 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-blue-600/5 border border-blue-600/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-blue-700">{stats.totalProjects}</div>
            <div className="text-[10px] font-black text-blue-600/70 uppercase tracking-wider mt-0.5">
              Tamamlanan Proje
            </div>
          </div>

          {stats.totalSqm > 0 && (
            <div className="bg-emerald-600/5 border border-emerald-600/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-700">
                {stats.totalSqm > 999
                  ? `${(stats.totalSqm / 1000).toFixed(1)}K`
                  : stats.totalSqm.toLocaleString('tr-TR')}
              </div>
              <div className="text-[10px] font-black text-emerald-600/70 uppercase tracking-wider mt-0.5">
                m² Uygulama
              </div>
            </div>
          )}

          {stats.uniqueSectors > 0 && (
            <div className="bg-purple-600/5 border border-purple-600/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-purple-700">{stats.uniqueSectors}</div>
              <div className="text-[10px] font-black text-purple-600/70 uppercase tracking-wider mt-0.5">
                Farklı Sektör
              </div>
            </div>
          )}

          {stats.latestYear && (
            <div className="bg-amber-600/5 border border-amber-600/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-amber-700">{stats.latestYear}</div>
              <div className="text-[10px] font-black text-amber-600/70 uppercase tracking-wider mt-0.5">
                Son Proje
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sektörel Gruplar */}
      {sectorGroups.length > 1 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award size={14} className="text-blue-600" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Sektörlere Göre Deneyim
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {sectorGroups.map((group) => (
              <div
                key={group.sector}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${getSectorColor(group.sector)}`}
              >
                {getSectorIcon(group.sector)}
                <span>{group.sector}</span>
                <span className="opacity-60">({group.count} proje
                  {group.totalSqm > 0 && `, ${group.totalSqm.toLocaleString('tr-TR')} m²`}
                  )
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proje Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {references.slice(0, 6).map((ref) => (
          <Link
            key={ref.id}
            href={`/referanslar/${ref.slug}`}
            className="group flex flex-col bg-white border border-black/5 rounded-[24px] overflow-hidden
                       hover:border-blue-600/20 hover:shadow-xl transition-all duration-500"
            aria-label={`${ref.title} – ${cityName} referans projesi`}
          >
            {/* Görsel */}
            <div className="relative w-full aspect-[16/9] bg-[#f4f6fa] overflow-hidden">
              {ref.featured_image_url ? (
                <img
                  src={ref.featured_image_url}
                  alt={`${ref.title} – ${cityName} ${serviceName ?? ''}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 size={36} className="text-black/10" />
                </div>
              )}

              {/* Sektör Badge */}
              {ref.sector && (
                <div className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${getSectorColor(ref.sector)}`}>
                  {getSectorIcon(ref.sector)}
                  {ref.sector}
                </div>
              )}

              {/* Logo overlay */}
              {ref.logo_path && (
                <div className="absolute bottom-3 left-3 w-10 h-10 bg-white rounded-xl border border-black/5 shadow-lg overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={ref.logo_path}
                    alt={`${ref.title} logo`}
                    className="object-contain w-full h-full"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* İçerik */}
            <div className="flex flex-col flex-1 p-5">
              <h3 className="text-[14px] font-black text-black italic tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {ref.title}
              </h3>

              {ref.short_description && (
                <p className="text-black/50 text-[12px] leading-relaxed mb-3 line-clamp-2">
                  {ref.short_description}
                </p>
              )}

              {/* Challenge highlight */}
              {ref.challenge && (
                <div className="text-[11px] text-slate-500 leading-snug line-clamp-2 border-l-2 border-blue-600 pl-2 italic mb-3">
                  <span className="font-bold text-slate-700 not-italic mr-1">Zorluk:</span>
                  {ref.challenge}
                </div>
              )}

              {/* Meta */}
              <div className="mt-auto pt-3 border-t border-black/5 flex flex-wrap items-center gap-2">
                {ref.project_size && ref.project_size > 0 && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-black/40 uppercase tracking-wide">
                    <Maximize2 size={9} className="text-blue-600" />
                    {ref.project_size.toLocaleString('tr-TR')} m²
                  </span>
                )}
                {ref.project_date && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-black/40 uppercase tracking-wide">
                    <Calendar size={9} className="text-blue-600" />
                    {new Date(ref.project_date).getFullYear()}
                  </span>
                )}
                {ref.system_type && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    <Layers size={9} />
                    {ref.system_type}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alt CTA */}
      {references.length > 6 && (
        <div className="text-center mt-8">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-black/10 text-black rounded-2xl text-sm font-black hover:border-blue-600/30 hover:text-blue-600 transition-all uppercase tracking-widest"
          >
            {cityName}&apos;daki Tüm Referansları Gör
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
