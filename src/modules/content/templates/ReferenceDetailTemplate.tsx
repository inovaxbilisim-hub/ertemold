// Image import removed (unused)
import Link from 'next/link';
import { Reference, Service } from '@/core/types';
import { ArrowLeft, CheckCircle2, MapPin, Calendar, Building, Expand, Briefcase, ArrowRight, Layers, Settings, HardHat, Droplets, Ruler, Weight, Timer, AlertTriangle, Lightbulb, Video, Sparkles, Zap } from 'lucide-react';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { generateTimeline } from '@/plugins/project-timeline/index';
import { AiOverviewsHelper } from '@/domains/seo-engine/aeo/AiOverviewsHelper';

interface ReferenceDetailTemplateProps {
  reference: Reference;
  service?: Service;
  settings?: any;
}

export default function ReferenceDetailTemplate({ reference, service, settings }: ReferenceDetailTemplateProps) {
  const isTimelineActive = settings?.active_plugins?.includes('project-timeline');
  // Date Formatter
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Fallback if invalid
      return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    } catch {
      return dateString;
    }
  };

  // Duration Calculator
  const getDuration = () => {
    if (!reference.project_date || !reference.completion_date) return null;
    try {
      const start = new Date(reference.project_date);
      const end = new Date(reference.completion_date);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Aynı Gün';
      if (diffDays < 30) return `${diffDays} Gün`;
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) {
        const remainingDays = diffDays % 30;
        return `${diffMonths} Ay${remainingDays > 0 ? ` ${remainingDays} Gün` : ''}`;
      }
      const diffYears = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      return `${diffYears} Yıl${remainingMonths > 0 ? ` ${remainingMonths} Ay` : ''}`;
    } catch {
      return null;
    }
  };

  const duration = getDuration();

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative w-full bg-white border-b border-slate-100 pt-28 pb-12 md:pt-32 md:pb-16">
        {reference.featuredImageUrl ? (
          <div className="w-full h-[300px] md:h-[420px] overflow-hidden rounded-2xl mx-auto max-w-[1200px] px-4 md:px-6 mb-8 relative">
            <img
              src={reference.featuredImageUrl}
              alt={reference.name || 'Proje Görseli'}
              className="object-cover w-full h-full rounded-2xl"
            />
          </div>
        ) : null}

        <div className="container-boxed max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl">
            <Link 
              href="/referanslar" 
              className="inline-flex items-center text-slate-500 hover:text-brand-primary mb-6 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tüm Referanslar
            </Link>
            
            {reference.sector && (
              <div className="inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider rounded mb-4">
                {reference.sector}
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {reference.name}
            </h1>
            
            {reference.projectSummary && (
              <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl">
                {reference.projectSummary}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container-boxed max-w-[1200px] mx-auto px-4 md:px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Before / After Images */}
            {(reference.beforeImageUrl || reference.afterImageUrl) && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <div className="w-1.5 h-6 bg-brand-primary rounded-full mr-3"></div>
                  Proje Görselleri
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reference.beforeImageUrl && (
                    <div className="group">
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-100">
                        <img
                          src={reference.beforeImageUrl}
                          alt="Öncesi"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-center font-bold text-slate-500 uppercase tracking-widest text-sm">Uygulama Öncesi</p>
                    </div>
                  )}
                  
                  {reference.afterImageUrl && (
                    <div className="group">
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-100">
                        <img
                          src={reference.afterImageUrl}
                          alt="Sonrası"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-center font-bold text-brand-primary uppercase tracking-widest text-sm">Uygulama Sonrası</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AEO: Challenge & Solution */}
            {(reference.challenge || reference.solution) && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col gap-8">
                {reference.challenge && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 mr-4 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      Karşılaşılan Zorluklar
                    </h2>
                    <p className="text-slate-700 leading-relaxed text-lg pl-14">
                      {reference.challenge}
                    </p>
                  </div>
                )}
                
                {reference.challenge && reference.solution && (
                  <div className="h-px bg-slate-100 w-full ml-14"></div>
                )}
                
                {reference.solution && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mr-4 shrink-0">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      Uygulanan Çözüm
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-lg pl-14">
                      {reference.solution}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Video YoutTube Embed */}
            {reference.primary_video_url && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <div className="p-6 md:p-8 border-b border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Video className="w-6 h-6 text-brand-primary mr-3" />
                    Proje Videosu
                  </h2>
                </div>
                <div className="aspect-video w-full bg-slate-900">
                  {reference.primary_video_url.includes('youtube.com') || reference.primary_video_url.includes('youtu.be') ? (
                    <iframe 
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${reference.primary_video_url.includes('v=') ? reference.primary_video_url.split('v=')[1].split('&')[0] : reference.primary_video_url.split('/').pop()}`}
                      title={`${reference.name} Video`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video 
                      className="w-full h-full object-cover"
                      controls
                      src={reference.primary_video_url}
                    >
                      Tarayıcınız video etiketini desteklemiyor.
                    </video>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {reference.description && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <div className="w-1.5 h-6 bg-brand-primary rounded-full mr-3"></div>
                  Proje Detayları
                </h2>
                <div 
                  className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-brand-primary"
                  dangerouslySetInnerHTML={{ __html: AiOverviewsHelper.injectAiFriendlyMarkers(reference.description || '') }} 
                />
              </div>
            )}

            {/* Dinamik Proje Zaman Tüneli Modülü */}
            {isTimelineActive && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                  <div className="w-1.5 h-6 bg-brand-primary rounded-full mr-3"></div>
                  Uygulama Süreç Aşamaları (Timeline)
                </h2>
                
                <div className="relative border-l-2 border-slate-100 ml-4 md:ml-6 space-y-8 pb-2">
                  {HookRegistry.applyFilters(
                    'reference_timeline',
                    generateTimeline(reference, service),
                    { reference, service, settings }
                  ).map((stage, idx) => {
                    const IconComponent = (() => {
                      switch (stage.icon) {
                        case 'HardHat': return HardHat;
                        case 'Droplets': return Droplets;
                        case 'Layers': return Layers;
                        case 'Settings': return Settings;
                        case 'Zap': return Zap;
                        case 'Sparkles': return Sparkles;
                        case 'CheckCircle2': default: return CheckCircle2;
                      }
                    })();

                    return (
                      <div key={idx} className="relative pl-8 md:pl-10">
                        {/* Dot / Icon container */}
                        <div className="absolute -left-[17px] md:-left-[21px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-brand-primary flex items-center justify-center text-brand-primary shadow-sm">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        
                        <div>
                          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 font-black rounded-md text-[10px] uppercase tracking-wider mb-2">
                            {stage.day}. Gün
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{stage.title}</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">{stage.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Features */}
            {reference.features && reference.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <div className="w-1.5 h-6 bg-brand-primary rounded-full mr-3"></div>
                  Uygulama Özellikleri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reference.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-brand-primary mr-3 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Proje Künyesi</h3>
              
              <ul className="space-y-5">
                {reference.city_name && (
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-primary shrink-0 mr-4">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-0.5">Lokasyon</p>
                      <p className="text-slate-900 font-bold">{reference.city_name}</p>
                    </div>
                  </li>
                )}
                
                {service && (
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-primary shrink-0 mr-4">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-0.5">Hizmet</p>
                      <Link 
                        href={`/hizmetler/${service.slug}`}
                        className="text-brand-primary font-bold hover:underline inline-flex items-center"
                      >
                        {service.title}
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </li>
                )}

                {reference.sector && (
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-primary shrink-0 mr-4">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-0.5">Sektör</p>
                      <p className="text-slate-900 font-bold">{reference.sector}</p>
                    </div>
                  </li>
                )}

                {reference.project_size && (
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-primary shrink-0 mr-4">
                      <Expand className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-0.5">Proje Boyutu</p>
                      <p className="text-slate-900 font-bold">{reference.project_size} m²</p>
                    </div>
                  </li>
                )}

                {reference.project_date && (
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-primary shrink-0 mr-4">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-0.5">Başlangıç</p>
                      <p className="text-slate-900 font-bold">{formatDate(reference.project_date)}</p>
                    </div>
                  </li>
                )}

                {reference.completion_date && (
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-primary shrink-0 mr-4">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-0.5">Bitiş</p>
                      <p className="text-slate-900 font-bold">{formatDate(reference.completion_date)}</p>
                    </div>
                  </li>
                )}

                {duration && (
                  <li className="flex items-start mt-4 pt-4 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 mr-4">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-brand-primary/80 font-medium mb-0.5">Proje Süresi</p>
                      <p className="text-brand-primary font-bold">{duration}</p>
                    </div>
                  </li>
                )}
                
                {/* --- TEKNİK VERİLER --- */}
                {(reference.system_type || reference.application_type || reference.concrete_type) && (
                  <li className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Teknik Detaylar</h4>
                    <div className="space-y-4">
                      {reference.system_type && (
                        <div className="flex items-start">
                          <Layers className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Sistem Tipi</p>
                            <p className="text-sm text-slate-900 font-medium">{reference.system_type}</p>
                          </div>
                        </div>
                      )}
                      {reference.application_type && (
                        <div className="flex items-start">
                          <Settings className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Uygulama Tipi</p>
                            <p className="text-sm text-slate-900 font-medium">{reference.application_type}</p>
                          </div>
                        </div>
                      )}
                      {reference.concrete_type && (
                        <div className="flex items-start">
                          <HardHat className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Beton Tipi</p>
                            <p className="text-sm text-slate-900 font-medium">{reference.concrete_type}</p>
                          </div>
                        </div>
                      )}
                      {reference.coating_thickness_mm && (
                        <div className="flex items-start">
                          <Ruler className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Kalınlık</p>
                            <p className="text-sm text-slate-900 font-medium">{reference.coating_thickness_mm} mm</p>
                          </div>
                        </div>
                      )}
                      {reference.coverage_rate_sqm_kg && (
                        <div className="flex items-start">
                          <Weight className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Tüketim</p>
                            <p className="text-sm text-slate-900 font-medium">{reference.coverage_rate_sqm_kg === 8.1 ? '8+' : reference.coverage_rate_sqm_kg} m²/kg</p>
                          </div>
                        </div>
                      )}
                      {reference.curing_time_hours && (
                        <div className="flex items-start">
                          <Timer className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Kürlenme</p>
                            <p className="text-sm text-slate-900 font-medium">{reference.curing_time_hours} Saat</p>
                          </div>
                        </div>
                      )}
                      {reference.moisture_problem && (
                        <div className="flex items-start p-3 bg-blue-50 rounded-lg mt-2 border border-blue-100">
                          <Droplets className="w-4 h-4 text-blue-500 mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-blue-800 font-bold">Zeminde Nem Problemi Çözüldü</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                )}
              </ul>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link 
                  href="/iletisim" 
                  className="w-full flex items-center justify-center px-6 py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors"
                >
                  Projeniz İçin Teklif Alın
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
