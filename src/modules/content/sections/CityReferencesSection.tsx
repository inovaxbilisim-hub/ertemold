import Link from 'next/link';
import { ArrowRight, Building2, MapPin, Calendar, Layers, PlayCircle, Wrench } from 'lucide-react';
import CloudinaryImage from '@/shared/components/CloudinaryImage';
import type { CityReference } from '@/lib/data-pseo';

interface CityReferencesSectionProps {
  references: CityReference[];
  cityName: string;
  serviceName?: string;
  viewAllHref?: string;
}

export default function CityReferencesSection({
  references,
  cityName,
  serviceName,
  viewAllHref = '/referanslar',
}: CityReferencesSectionProps) {
  if (!references || references.length === 0) return null;

  return (
    <section
      id="sehir-referanslari"
      className="border-t border-black/5 py-12 md:py-16 relative z-10"
      aria-label={`${cityName} referans projeleri`}
    >
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-[2px] bg-blue-600" />
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
              Lokal Deneyim
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-black italic tracking-tighter leading-tight">
            {cityName}&apos;da{' '}
            <span className="text-blue-600">
              {serviceName ? `${serviceName} ` : ''}Gerçekleştirilen Projeler
            </span>
          </h2>
          <p className="text-black/40 text-sm font-bold mt-2 max-w-[500px]">
            Aşağıdaki referanslar {cityName} ilinde fiilen tamamlanan projelerimizden seçilmiştir.
          </p>
        </div>

        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-black/40 hover:text-blue-600 transition-colors shrink-0"
        >
          Tüm Referanslar
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Kart Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {references.map((ref) => (
          <Link
            key={ref.id}
            href={`/referanslar/${ref.slug}`}
            className="group flex flex-col bg-white border border-black/5 rounded-[28px] overflow-hidden hover:border-blue-600/20 hover:shadow-xl transition-all duration-500"
            aria-label={`${ref.title} - ${cityName} referans projesi`}
          >
            {/* Görsel */}
            <div className="relative w-full aspect-[16/9] bg-[#f4f6fa] overflow-hidden">
              {ref.featured_image_url ? (
                <CloudinaryImage
                  src={ref.featured_image_url}
                  alt={`${ref.title} – ${cityName} ${serviceName ?? ''} uygulaması`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 size={40} className="text-black/10" />
                </div>
              )}

              {/* Logo overlay */}
              {ref.logo_path && (
                <div className="absolute bottom-3 left-3 w-12 h-12 bg-white rounded-xl border border-black/5 shadow-lg overflow-hidden flex items-center justify-center p-1.5">
                  <CloudinaryImage
                    src={ref.logo_path}
                    alt={`${ref.title} logo`}
                    width={40}
                    height={40}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Öne çıkan rozeti */}
              {ref.featured && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Öne Çıkan
                </div>
              )}

              {/* Video Indicator */}
              {ref.primary_video_url && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <PlayCircle size={10} /> VİDEO
                </div>
              )}
            </div>

            {/* İçerik */}
            <div className="flex flex-col flex-1 p-5">
              <h3 className="text-[15px] font-black text-black leading-tight italic tracking-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {ref.title}
              </h3>

              {ref.short_description && (
                <p className="text-black/50 text-[13px] font-medium leading-relaxed mb-4 line-clamp-2">
                  {ref.short_description}
                </p>
              )}

              <div className="mt-auto flex flex-col gap-3">
                {/* Teknik Veriler */}
                {(ref.system_type || ref.coating_thickness_mm) && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-wrap gap-2 text-[10px] font-bold text-slate-600">
                    {ref.system_type && (
                      <span className="flex items-center gap-1 text-slate-800">
                        <Wrench size={10} className="text-blue-600" />
                        {ref.system_type}
                      </span>
                    )}
                    {ref.system_type && ref.coating_thickness_mm && (
                      <span className="text-slate-300">•</span>
                    )}
                    {ref.coating_thickness_mm && (
                      <span>{ref.coating_thickness_mm} mm Kalınlık</span>
                    )}
                  </div>
                )}
                
                {/* Challenge / Solution Kısmi Gösterimi */}
                {ref.challenge && (
                   <div className="text-[11px] font-medium text-slate-500 leading-snug line-clamp-2 border-l-2 border-blue-600 pl-2 italic">
                     <span className="font-bold text-slate-700 not-italic mr-1">Zorluk:</span>
                     {ref.challenge}
                   </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-black/5 mt-1">
                {/* Şehir */}
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-black/40 uppercase tracking-wide">
                  <MapPin size={11} className="text-blue-600" />
                  {ref.city_name || cityName}
                </span>

                {/* Tarih */}
                {ref.project_date && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-black/40 uppercase tracking-wide">
                    <Calendar size={11} className="text-blue-600" />
                    {new Date(ref.project_date).getFullYear()}
                  </span>
                )}

                {/* Alan */}
                {ref.project_size && ref.project_size > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-black/40 uppercase tracking-wide">
                    <Layers size={11} className="text-blue-600" />
                    {ref.project_size.toLocaleString('tr-TR')} m²
                  </span>
                )}

                {/* Sektör */}
                {ref.sector && (
                  <span className="ml-auto text-[9px] font-black bg-blue-600/5 text-blue-700 border border-blue-600/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {ref.sector}
                  </span>
                )}
              </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
