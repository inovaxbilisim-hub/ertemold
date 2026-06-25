import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSectors, getServices, getSettings } from '@/lib/data';
import * as LucideIcons from 'lucide-react';
import ServicesSection from '@/modules/content/sections/ServicesSection';
import FaqSection from '@/modules/content/sections/FaqSection';
import pluginDef from '@/plugins/sektorler/plugin.json';
import { EntityExtractor, SpeakableGenerator, SchemaGenerator } from '@/domains/seo-engine';
import StructuredData from '@/modules/seo/components/StructuredData';
import PhoneLink from '@/shared/layout/PhoneLink';

export async function generateStaticParams() {
  const sectors = await getSectors();
  return sectors.map((sector) => ({
    slug: sector.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sectors = await getSectors();
  const sector = sectors.find(s => s.slug === slug && s.active);
  if (!sector) return {};

  let seoTitle = `${sector.name} Çözümleri | Sektörlerimiz`;
  let seoDesc = sector.description?.replace(/<[^>]+>/g, '').substring(0, 160) || `${sector.name} sektörü için özel zemin ve yalıtım çözümleri.`;

  if (sector.ui_metadata) {
    try {
      const meta = JSON.parse(sector.ui_metadata);
      if (meta.seo_title) seoTitle = meta.seo_title;
      if (meta.seo_description) seoDesc = meta.seo_description;
    } catch (e) { }
  }

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: { title: seoTitle, description: seoDesc, type: 'website', url: `/sektorler/${slug}` },
    alternates: { canonical: `/sektorler/${slug}` },
  };
}

export default async function SektorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [sectors, services, settings] = await Promise.all([getSectors(), getServices(), getSettings()]);

  const sector = sectors.find(s => s.slug === slug && s.active);
  if (!sector) notFound();

  const compatibleServices = services.filter(s => s.active && sector.recommended_service_ids?.includes(s.id));
  const IconComponent = (LucideIcons as any)[sector.icon || 'Hexagon'] || LucideIcons.Hexagon;

  const pluginConfig = settings?.plugin_configs?.['sektorler'] || {};
  const fd = (key: string) => pluginDef.configSchema.fields.find((f: any) => f.key === key)?.default;

  const cta_title = pluginConfig.cta_title || fd('cta_title');
  const cta_text = pluginConfig.cta_text || fd('cta_text');
  const cta_link = pluginConfig.cta_link || fd('cta_link');
  const other_sectors_title = pluginConfig.detail_other_sectors_title || fd('detail_other_sectors_title');
  const badge_1_fallback = pluginConfig.detail_badge_1 || fd('detail_badge_1');
  const badge_2_fallback = pluginConfig.detail_badge_2 || fd('detail_badge_2');

  let meta: any = {};
  if (sector.ui_metadata) { try { meta = JSON.parse(sector.ui_metadata); } catch (e) { } }

  const heroDescription = meta.hero_description || meta.seo_description ||
    sector.description?.replace(/<[^>]+>/g, '').substring(0, 200) ||
    `${sector.name} tesislerinin zorlu şartlarına karşı dayanıklı, güvenli ve uzun ömürlü zemin kaplama sistemleri.`;

  const sectorFaqs: { question: string; answer: string }[] =
    meta.faqs && Array.isArray(meta.faqs) ? meta.faqs : [];

  const faqSchema = sectorFaqs.length > 0 ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: sectorFaqs.map(faq => ({
      '@type': 'Question', name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer.replace(/<[^>]+>/g, '') },
    })),
  } : null;

  const dbEntityResult = EntityExtractor.extract({ content: `${sector.name} ${sector.description || ''}`, pageType: 'sektorler_detail' });
  const dbEntityGraph = EntityExtractor.buildEntityGraph(dbEntityResult.entities);
  const dbSpeakableSchema = await SpeakableGenerator.build({ title: `${sector.name} Sektörel Çözümleri`, description: sector.description || `${sector.name} için özel zemin çözümleri.`, pageType: 'sektorler_detail' });
  const breadcrumbSchema = await SchemaGenerator.buildBreadcrumbSchema({ crumbs: [{ label: 'Ana Sayfa', href: '/' }, { label: 'Sektörler', href: '/sektorler' }, { label: sector.name, href: `/sektorler/${sector.slug}` }], settings });
  const globalSchema = await SchemaGenerator.buildGlobalSchema(settings);

  const badge1 = meta.action_verb || badge_1_fallback;
  const badge2 = meta.value_prop || badge_2_fallback;
  const otherSectors = sectors.filter(s => s.id !== sector.id && s.active).slice(0, 4);
  const activeSectorCount = sectors.filter(s => s.active).length;

  return (
    <>
      <StructuredData id={`sector-${sector.id}-global-schema`} data={globalSchema} />
      <StructuredData id={`sector-${sector.id}-entity-graph`} data={dbEntityGraph} />
      <StructuredData id={`sector-${sector.id}-speakable`} data={dbSpeakableSchema} />
      <StructuredData id={`sector-${sector.id}-breadcrumb`} data={breadcrumbSchema} />
      {faqSchema && <StructuredData id={`sector-${sector.id}-faq-schema`} data={faqSchema} />}

      <main className="bg-white min-h-screen pt-32 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />

        {/* ═══ HERO ═══════════════════════════════════════════ */}
        <section className="relative z-10 max-w-[1280px] mx-auto px-6 mb-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-black/40 mb-10 font-medium" aria-label="Sayfa Konumu">
            <a href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</a>
            <LucideIcons.ChevronRight size={14} className="text-black/20" />
            <a href="/sektorler" className="hover:text-blue-600 transition-colors">Sektörler</a>
            <LucideIcons.ChevronRight size={14} className="text-black/20" />
            <span className="text-black/60 font-semibold">{sector.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 border border-black/5 bg-black/[0.02] rounded-full px-5 py-2 mb-8 shadow-sm">
                <LucideIcons.Star size={14} className="text-blue-600 fill-blue-600/20" />
                <span className="text-black/60 text-[10px] font-black tracking-[0.3em] uppercase">Sektörel Uzmanlık</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight mb-5 italic uppercase">
                {sector.name}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Zemin Çözümleri</span>
              </h1>

              <p className="text-base md:text-lg text-black/50 max-w-[640px] leading-relaxed mb-10 font-medium">
                {heroDescription}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 mb-12">
                <div className="flex items-center gap-2 text-[12px] font-bold text-black/60 px-4 py-2 rounded-full border border-black/5 bg-black/[0.02] uppercase tracking-wide">
                  <LucideIcons.ShieldCheck size={15} className="text-blue-600" />
                  {badge1}
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-black/60 px-4 py-2 rounded-full border border-black/5 bg-black/[0.02] uppercase tracking-wide">
                  <LucideIcons.Zap size={15} className="text-blue-600" />
                  {badge2}
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-black/60 px-4 py-2 rounded-full border border-black/5 bg-black/[0.02] uppercase tracking-wide">
                  <LucideIcons.Award size={15} className="text-blue-600" />
                  ISO Standartları
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <a href={cta_link}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-black hover:bg-gray-900 text-white font-black text-[15px] transition-all duration-200 shadow-xl uppercase tracking-wide cursor-pointer">
                  Ücretsiz Keşif Al
                  <LucideIcons.ArrowRight size={18} />
                </a>
                <a href={settings?.navigation?.find(n => n.label.toLowerCase().includes('hizmet'))?.href || '/hizmetler'}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-black font-black text-[15px] transition-all duration-200 border border-black/10 bg-black/[0.02] hover:bg-black/5 uppercase tracking-wide cursor-pointer">
                  Hizmetleri Gör
                </a>
              </div>
            </div>

            {/* Ghost icon — desktop only */}
            <div className="hidden lg:flex items-center justify-center text-black/[0.02]">
              <IconComponent size={220} strokeWidth={0.5} />
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-black/5">
            {[
              { label: 'Yıllık Deneyim', value: '20+', icon: LucideIcons.Calendar },
              { label: 'Tamamlanan Proje', value: '5.000+', icon: LucideIcons.CheckCircle2 },
              { label: 'Aktif Sektör', value: `${activeSectorCount}`, icon: LucideIcons.Building2 },
              { label: 'Müşteri Memnuniyeti', value: '%98', icon: LucideIcons.Star },
            ].map(stat => {
              const Ic = stat.icon;
              return (
                <div key={stat.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 bg-blue-50 border border-blue-100">
                    <Ic size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">{stat.value}</div>
                    <div className="text-[10px] text-black/50 mt-0.5 uppercase tracking-[0.25em] font-black">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ CONTENT + STICKY SIDEBAR ════════════════════════════════ */}
        {sector.description && (
          <section className="relative z-10 max-w-[1280px] mx-auto px-6 mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-20 items-start">

              {/* Article */}
              <div>
                <article
                  className="prose prose-slate prose-lg max-w-none
                    prose-h2:text-2xl prose-h2:font-black prose-h2:text-black prose-h2:tracking-tight prose-h2:mt-16 prose-h2:mb-5 prose-h2:italic prose-h2:uppercase
                    prose-h3:text-lg prose-h3:font-bold prose-h3:text-black prose-h3:mt-10 prose-h3:mb-3 prose-h3:uppercase
                    prose-p:text-black/60 prose-p:leading-relaxed prose-p:text-[15px] prose-p:font-medium
                    prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-a:no-underline prose-a:font-semibold
                    prose-ul:text-black/60 prose-li:marker:text-blue-500
                    prose-strong:text-black prose-strong:font-bold"
                  dangerouslySetInnerHTML={{ __html: sector.description }}
                />
              </div>

              {/* Sticky sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-28 space-y-5">
                  {/* Info card */}
                  <div className="rounded-[32px] overflow-hidden shadow-lg bg-[#fbfcff] border border-black/5">
                    <div className="px-6 py-4 flex items-center gap-3 text-white bg-black">
                      <IconComponent size={18} />
                      <span className="font-black text-[13px] uppercase tracking-wide">{sector.name}</span>
                    </div>
                    <div className="bg-white p-5 space-y-4">
                      {[
                        { label: 'Temel Fayda', value: badge1 },
                        { label: 'Değer Önerisi', value: badge2 },
                        ...(compatibleServices.length > 0 ? [{ label: 'Uygun Hizmet', value: `${compatibleServices.length} Çözüm` }] : []),
                      ].map(item => {
                        return (
                          <div key={item.label} className="flex items-start gap-3">
                            <div>
                              <div className="text-[10px] text-black/40 mb-0.5 uppercase tracking-[0.2em] font-black">{item.label}</div>
                              <div className="text-[13px] font-black text-black uppercase tracking-tight">{item.value}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="px-5 pb-5 bg-white">
                      <a href={cta_link}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-xl text-[13px] font-black transition-colors uppercase tracking-wide cursor-pointer">
                        <LucideIcons.Phone size={14} />
                        Hemen Teklif Al
                      </a>
                    </div>
                  </div>

                  {/* Other sectors mini */}
                  {otherSectors.length > 0 && (
                    <div className="rounded-[32px] bg-[#fbfcff] p-5 border border-black/5 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Diğer Sektörler</p>
                        <a href="/sektorler" className="text-[11px] font-black text-blue-600 hover:text-blue-500 flex items-center gap-1 transition-colors uppercase tracking-wide">
                          Tümünü Gör <LucideIcons.ArrowRight size={11} />
                        </a>
                      </div>
                      <div className="space-y-3">
                        {otherSectors.map(os => {
                          const OsIcon = (LucideIcons as any)[os.icon || 'Hexagon'] || LucideIcons.Hexagon;
                          return (
                            <a key={os.id} href={`/sektorler/${os.slug}`} className="flex items-center gap-3 group py-1 cursor-pointer">
                              <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-blue-50 flex items-center justify-center text-black/40 group-hover:text-blue-600 transition-colors shrink-0 border border-black/5">
                                <OsIcon size={14} />
                              </div>
                              <span className="text-[13px] font-bold text-black/70 group-hover:text-blue-600 transition-colors flex-1 uppercase tracking-tight">{os.name}</span>
                              <LucideIcons.ChevronRight size={14} className="text-black/20 group-hover:text-blue-400 transition-colors" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </aside>

            </div>
          </section>
        )}

        {/* ═══ SERVICES ════════════════════════════════════════════════ */}
        {compatibleServices.length > 0 && (
          <section className="relative z-10 max-w-[1280px] mx-auto px-6 mb-24">
            <ServicesSection
              services={compatibleServices}
              sectionContent={{ sectionKey: 'sector-services', badge: '', title: '', subtitle: '', content: '' }}
            />
          </section>
        )}

        {/* ═══ FAQ ══════════════════════════════════════════════════════ */}
        {sectorFaqs.length > 0 && (
          <FaqSection
            faqs={sectorFaqs.map((faq, i) => ({ id: String(i), question: faq.question, answer: faq.answer, active: true, category: 'Genel', sort_order: i }))}
            title={`${sector.name} Hakkında Sık Sorulan Sorular`}
            badge="S.S.S"
          />
        )}

        {/* ═══ MORE SECTORS — mobile ════════════════════════════════════ */}
        {otherSectors.length > 0 && (
          <section className="relative z-10 max-w-[1280px] mx-auto px-6 mb-24 lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">{other_sectors_title}</p>
              <a href="/sektorler" className="inline-flex items-center gap-1.5 text-[12px] font-black text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-wider">
                Tümünü Gör <LucideIcons.ArrowRight size={14} />
              </a>
            </div>
            <div className="space-y-3">
              {otherSectors.map(os => {
                const OsIcon = (LucideIcons as any)[os.icon || 'Hexagon'] || LucideIcons.Hexagon;
                return (
                  <a key={os.id} href={`/sektorler/${os.slug}`}
                    className="flex items-center gap-4 p-4 rounded-[24px] transition-all group bg-[#fbfcff] border border-black/5 shadow-lg hover:shadow-2xl cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-blue-50 flex items-center justify-center text-black/50 group-hover:text-blue-600 transition-colors shrink-0 border border-black/5">
                      <OsIcon size={18} />
                    </div>
                    <span className="font-black text-[15px] text-black/80 group-hover:text-blue-600 transition-colors flex-1 uppercase tracking-tight italic">{os.name}</span>
                    <LucideIcons.ChevronRight size={16} className="text-black/20 group-hover:text-blue-400 transition-colors" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ CTA ══════════════════════════════════════════════════════ */}
        <section className="relative z-10 max-w-[1280px] mx-auto px-6">
          <div className="bg-black rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 grid-pattern opacity-[0.1] contrast-200" />
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-teal-500" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-5 py-2 mb-8 shadow-sm">
                <LucideIcons.Sparkles size={12} className="text-blue-400" />
                <span className="text-white/60 text-[10px] font-black tracking-[0.3em] uppercase">Ücretsiz Keşif & Projelendirme</span>
              </div>

              <h2 className="text-lg md:text-2xl font-black text-white mb-6 tracking-tighter leading-tight italic uppercase">
                {cta_title}
              </h2>

              <p className="text-white/50 text-base md:text-lg max-w-[560px] mx-auto mb-12 leading-relaxed font-medium">
                {sector.name} tesisinize özel ücretsiz keşif ve projelendirme hizmetimizden faydalanın.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={cta_link}
                  className="inline-flex items-center gap-2.5 px-9 py-4 bg-white text-black font-black rounded-2xl text-[15px] hover:bg-gray-50 transition-all shadow-xl uppercase tracking-wide cursor-pointer">
                  {cta_text}
                  <LucideIcons.ArrowRight size={18} />
                </a>
                <PhoneLink
                  phone={settings?.phone || ''}
                  href={settings?.phone ? `tel:${settings.phone.replace(/[^0-9+]/g, '')}` : undefined}
                  source="sector-detail-cta"
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
