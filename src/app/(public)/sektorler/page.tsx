import { Metadata } from 'next';
import { getSectors, getSettings } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import pluginDef from '@/plugins/sektorler/plugin.json';
import { EntityExtractor, SpeakableGenerator, SchemaGenerator } from '@/domains/seo-engine';
import StructuredData from '@/modules/seo/components/StructuredData';
import PhoneLink from '@/shared/layout/PhoneLink';

export const revalidate = 604800;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const pluginConfig = settings?.plugin_configs?.['sektorler'] || {};
  const fd = (key: string) => pluginDef.configSchema.fields.find((f: any) => f.key === key)?.default;

  const title = pluginConfig.seo_title || fd('seo_title');
  const description = pluginConfig.seo_description || fd('seo_description');

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url: '/sektorler' },
    alternates: { canonical: '/sektorler' },
  };
}

export default async function SektorlerPage() {
  const [sectors, settings] = await Promise.all([getSectors(), getSettings()]);

  const pluginConfig = settings?.plugin_configs?.['sektorler'] || {};
  const fd = (key: string) => pluginDef.configSchema.fields.find((f: any) => f.key === key)?.default;

  const title = pluginConfig.title || fd('title');
  const subtitle = pluginConfig.subtitle || fd('subtitle');
  const intro_text = pluginConfig.intro_text || fd('intro_text');
  const seoDesc = pluginConfig.seo_description || fd('seo_description');
  const featuredSlugsStr = pluginConfig.featured_sector_slugs || fd('featured_sector_slugs') || '';
  const featuredSlugs: string[] = featuredSlugsStr.trim() ? featuredSlugsStr.split(',').map((s: string) => s.trim()) : [];

  const activeSectors = sectors.filter(s => s.active);
  const featuredSectors = activeSectors.filter(s => featuredSlugs.includes(s.slug));
  const normalSectors = activeSectors.filter(s => !featuredSlugs.includes(s.slug)).sort((a, b) => a.sort_order - b.sort_order);

  const dbEntityResult = EntityExtractor.extract({ content: `${title} ${subtitle} ${intro_text}`, pageType: 'sektorler_index' });
  const dbEntityGraph = EntityExtractor.buildEntityGraph(dbEntityResult.entities);
  const dbSpeakableSchema = await SpeakableGenerator.build({ title: title as string, description: seoDesc as string, pageType: 'sektorler_index' });
  const globalSchema = await SchemaGenerator.buildGlobalSchema(settings);
  const defaultLogo = settings?.brand?.logoPath || '/logo.png';

  return (
    <>
      <StructuredData id="sektorler-global-schema" data={globalSchema} />
      <StructuredData id="sektorler-entity-graph" data={dbEntityGraph} />
      <StructuredData id="sektorler-speakable" data={dbSpeakableSchema} />

      <main className="bg-white min-h-screen pt-32 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
        
        {/* ═══ HERO ══════════════════════════════════════════════════════ */}
        <header className="relative z-10 max-w-[1280px] mx-auto px-6 mb-24">
          <section className="text-left md:text-center">
            <div className="inline-flex items-center gap-2 border border-black/5 bg-black/[0.02] rounded-full px-5 py-2 mb-8 shadow-sm">
              <LucideIcons.Star size={14} className="text-blue-600 fill-blue-600/20" />
              <span className="text-black/60 text-[10px] font-black tracking-[0.3em] uppercase">Sektörel Uzmanlık</span>
            </div>
            
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-black mb-8 leading-tight italic uppercase">
              {title && typeof title === 'string' && title.includes(' ') ? (
                <>
                  {title.split(' ').slice(0, -1).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 pr-2">{title.split(' ').slice(-1)}</span>
                </>
              ) : title}
            </h1>
            
            {subtitle && (
              <p className="text-black/50 text-base md:text-lg leading-relaxed max-w-[700px] mx-auto font-semibold mb-6">
                {subtitle}
              </p>
            )}
            {intro_text && (
              <p className="text-black/40 text-sm md:text-base leading-relaxed max-w-[640px] mx-auto font-medium">
                {intro_text}
              </p>
            )}

            {/* Counter strip */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {[
                { value: `${activeSectors.length}`, label: 'Sektör' },
                { value: '20+', label: 'Yıl Deneyim' },
                { value: '5.000+', label: 'Proje' },
                { value: '%98', label: 'Memnuniyet' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-1">{s.value}</div>
                  <div className="text-[10px] text-black/50 uppercase tracking-[0.25em] font-black">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        </header>

        {/* ═══ FEATURED SECTORS ══════════════════════════════════════════ */}
        {featuredSectors.length > 0 && (
          <section className="relative z-10 max-w-[1280px] mx-auto px-6 mb-24">
            {/* Section header */}
            <div className="text-left md:text-center mb-16">
              <div className="inline-flex items-center gap-2 border border-black/5 bg-black/[0.02] rounded-full px-5 py-2 mb-6 shadow-sm">
                <LucideIcons.Star size={14} className="text-blue-600 fill-blue-600/20" />
                <span className="text-black/60 text-[10px] font-black tracking-[0.3em] uppercase">Öne Çıkan</span>
              </div>
              <h2 className="text-base md:text-xl font-black text-black mb-4 italic uppercase tracking-tighter leading-tight">
                Öncelikli Sektörler
              </h2>
              <p className="text-black/40 text-sm md:text-base max-w-[600px] mx-auto font-medium leading-relaxed">
                Endüstriyel standartları belirleyen zemin ve kaplama çözümlerimiz.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {featuredSectors.map((sec) => {
                const Icon = (LucideIcons as any)[sec.icon || 'Star'] || LucideIcons.Star;
                const hasImg = !!sec.image_path;
                const desc = sec.description
                  ? sec.description.replace(/<[^>]+>/g, ' ').trim().substring(0, 200)
                  : `${sec.name} tesislerinde zemin dayanıklılığını ve teknik uyumluluğu maksimum seviyeye çıkaran spesifik uygulama metodolojisi.`;

                return (
                  <Link href={`/sektorler/${sec.slug}`} key={sec.id} className="group block outline-none h-full cursor-pointer">
                    <article className="relative h-full bg-[#fbfcff] rounded-[40px] overflow-hidden flex flex-col md:flex-row transition-all duration-500 shadow-lg hover:border-blue-600/20 hover:bg-white hover:shadow-2xl border border-black/5">

                      {/* Image column */}
                      <div className={`relative w-full md:w-[42%] shrink-0 h-56 md:h-auto bg-white flex items-center justify-center overflow-hidden ${!hasImg ? 'p-10' : ''}`}>
                        <Image
                          src={sec.image_path || defaultLogo}
                          alt={`${sec.name} Zemin Çözümleri`}
                          fill
                          className={`${hasImg ? 'object-cover' : 'object-contain opacity-30 grayscale'} group-hover:scale-105 transition-transform duration-500 ease-out`}
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                      </div>

                      {/* Content column */}
                      <div className="flex flex-col flex-1 p-7 lg:p-9">
                        <div className="flex items-start gap-4 mb-5">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 border border-blue-100">
                            <Icon size={22} strokeWidth={1.5} />
                          </div>
                          <h3 className="text-[17px] md:text-[19px] font-black text-black tracking-tight leading-tight group-hover:text-blue-600 transition-colors italic uppercase">
                            {sec.name}
                          </h3>
                        </div>

                        <p className="text-black/50 text-[13px] leading-relaxed mb-6 flex-1 line-clamp-3 font-medium">
                          {desc}{desc.length >= 200 ? '...' : ''}
                        </p>

                        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[12px] group-hover:gap-3 transition-all uppercase tracking-wider">
                          Çözümleri İncele
                          <LucideIcons.ArrowRight size={16} />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ ALL SECTORS GRID ══════════════════════════════════════════ */}
        {normalSectors.length > 0 && (
          <section className="relative z-10 max-w-[1280px] mx-auto px-6 mb-24">
            {/* Section header */}
            <div className="text-left md:text-center mb-16">
              <div className="inline-flex items-center gap-2 border border-black/5 bg-black/[0.02] rounded-full px-5 py-2 mb-6 shadow-sm">
                <LucideIcons.Grid3x3 size={14} className="text-black/60" />
                <span className="text-black/60 text-[10px] font-black tracking-[0.3em] uppercase">Tüm Sektörler</span>
              </div>
              <h2 className="text-base md:text-xl font-black text-black mb-4 italic uppercase tracking-tighter leading-tight">
                Tüm Endüstri Alanlarımız
              </h2>
              <p className="text-black/40 text-sm md:text-base max-w-[600px] mx-auto font-medium leading-relaxed">
                {activeSectors.length} farklı sektörde uzman zemin çözümleri sunuyoruz.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {normalSectors.map((sec) => {
                const Icon = (LucideIcons as any)[sec.icon || 'ShieldCheck'] || LucideIcons.ShieldCheck;
                const hasImg = !!sec.image_path;
                const desc = sec.description
                  ? sec.description.replace(/<[^>]+>/g, ' ').trim().substring(0, 130)
                  : `${sec.name} projeleri için profesyonel zemin çözümleri.`;

                return (
                  <Link href={`/sektorler/${sec.slug}`} key={sec.id} className="group block outline-none h-full cursor-pointer">
                    <article className="bg-[#fbfcff] border border-black/5 rounded-[40px] overflow-hidden h-full flex flex-col transition-all duration-500 shadow-lg hover:border-blue-600/20 hover:bg-white hover:shadow-2xl">

                      {/* Image top */}
                      <div className={`relative w-full h-44 bg-white shrink-0 overflow-hidden flex items-center justify-center ${!hasImg ? 'p-8' : ''}`}>
                        <Image
                          src={sec.image_path || defaultLogo}
                          alt={`${sec.name} Zemin Çözümleri`}
                          fill
                          className={`${hasImg ? 'object-cover' : 'object-contain opacity-25 grayscale'} group-hover:scale-105 transition-transform duration-500 ease-out`}
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                        {/* Hover accent */}
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                      </div>

                      <div className="flex flex-col flex-1 p-6 lg:p-8">
                        {/* Icon + title */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-blue-600 flex items-center justify-center text-black/60 group-hover:text-white transition-all duration-300 shrink-0 mt-0.5 border border-black/5">
                            <Icon size={18} strokeWidth={1.5} />
                          </div>
                          <h3 className="text-[15px] font-black text-black group-hover:text-blue-600 transition-colors leading-snug italic uppercase tracking-tight">
                            {sec.name}
                          </h3>
                        </div>

                        <p className="text-black/50 text-[13px] leading-relaxed flex-1 mb-5 line-clamp-3 font-medium">
                          {desc}{desc.length >= 130 ? '...' : ''}
                        </p>

                        <div className="flex items-center gap-1.5 text-black/40 group-hover:text-blue-600 font-bold text-[11px] uppercase tracking-wide transition-colors pt-4 border-t border-black/5">
                          Detaylı İncele
                          <LucideIcons.ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ AEO SUMMARY STRIP ══════════════════════════════════════════ */}
        <section id="speakable-summary" className="relative z-10 max-w-[1280px] mx-auto px-6 mb-24">
          <div className="bg-[#fbfcff] border border-black/5 rounded-[40px] p-10 md:p-16 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: LucideIcons.ShieldCheck, title: 'Endüstriyel Standartlar', desc: 'Her sektörün kendi teknik gereksinimlerine uygun, uluslararası normlarda zemin sistemleri.' },
                { icon: LucideIcons.Zap, title: 'Hızlı Uygulama', desc: 'Tesis faaliyetlerini minimum süre aksatacak şekilde optimize edilmiş yerinde uygulama süreçleri.' },
                { icon: LucideIcons.Clock, title: 'Uzun Ömürlü Çözümler', desc: 'Ağır iş yüklerine, kimyasal etkilere ve sıcaklık değişimlerine dayanıklı formülasyonlar.' },
              ].map(item => {
                const Ic = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                      <Ic size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-black text-black mb-2 text-[15px] uppercase tracking-tight italic">{item.title}</h3>
                      <p className="text-black/50 text-[13px] leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ CTA ══════════════════════════════════════════════════════ */}
        <section className="relative z-10 max-w-[1280px] mx-auto px-6">
          <div className="bg-black rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 grid-pattern opacity-[0.1] contrast-200" />
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-teal-500" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-5 py-2 mb-8 shadow-sm">
                <LucideIcons.Sparkles size={12} className="text-blue-400" />
                <span className="text-white/60 text-[10px] font-black tracking-[0.3em] uppercase">Ücretsiz Danışmanlık</span>
              </div>

              <h2 className="text-lg md:text-2xl font-black text-white mb-6 tracking-tighter leading-tight italic uppercase">
                Sektörünüz için<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">doğru çözümü</span> bulalım
              </h2>

              <p className="text-white/50 text-base md:text-lg max-w-[520px] mx-auto mb-12 leading-relaxed font-medium">
                Tesisinizin özel gereksinimlerini analiz edip en uygun zemin sistemini ücretsiz olarak planlıyoruz.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={settings?.navigation?.find(n => n.label.toLowerCase().includes('iletisim') || n.label.toLowerCase().includes('iletişim'))?.href || '/iletisim'}
                  className="inline-flex items-center gap-2.5 px-9 py-4 bg-white text-black font-black rounded-2xl text-[15px] hover:bg-gray-50 transition-all shadow-xl uppercase tracking-wide cursor-pointer">
                  Ücretsiz Teklif Al
                  <LucideIcons.ArrowRight size={18} />
                </a>
                <PhoneLink
                  phone={settings?.phone || ''}
                  href={settings?.phone ? `tel:${settings.phone.replace(/[^0-9+]/g, '')}` : undefined}
                  source="sectors-index-cta"
                  className="inline-flex items-center gap-2.5 px-9 py-4 font-black rounded-2xl text-[15px] text-white transition-all border border-white/20 bg-white/5 hover:bg-white/10 uppercase tracking-wide cursor-pointer"
                >
                  <LucideIcons.Phone size={18} />
                  Hemen Arayın
                </PhoneLink>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
