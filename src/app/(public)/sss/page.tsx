import { Metadata } from 'next';
import { getSettings, getFaqs } from '@/lib/data';
import FaqSection from '@/modules/content/sections/FaqSection';
import StructuredData from '@/modules/seo/components/StructuredData';
import { HelpCircle, MessageSquare, Phone } from 'lucide-react';
import PhoneLink from '@/shared/layout/PhoneLink';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular | Ertem Epoksi Teknik Destek',
  description: 'Epoksi zemin kaplama, uygulama süreçleri, fiyatlandırma ve teknik detaylar hakkında en çok sorulan soruların yanıtları.',
};

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([
    getFaqs(),
    getSettings().catch(() => null)
  ]);

  const faqSchema = (faqs && faqs.length > 0) ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq: any) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  const phoneVal = settings?.phone || '';

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-32 pb-20 px-4">
      {/* Hero Header */}
      <section className="container-boxed bg-white relative overflow-hidden rounded-[40px] shadow-sm border border-black/5 mb-12">
        <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-blue-600/[0.03] to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.05] blur-[100px] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4" />
        
        <div className="relative z-10 p-10 md:p-20 text-center max-w-[800px] mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600/10 text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-8 border border-blue-600/10">
            <HelpCircle size={14} strokeWidth={3} />
            Destek Merkezi
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-black mb-8 italic tracking-tighter leading-[0.9]">
            Aklınıza Takılan <br />
            <span className="text-blue-600">Her Şeyi</span> Yanıtladık
          </h1>

          <p className="text-lg md:text-xl text-black/50 font-medium tracking-tight mb-12 leading-relaxed">
            Epoksi zemin kaplama süreçlerinden maliyetlere, uygulama sürelerinden teknik spesifikasyonlara kadar tüm merak edilenler tek bir yerde.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <PhoneLink 
              phone={phoneVal}
              source="faq-hero-call"
              className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all hover:scale-105 shadow-xl shadow-black/10 cursor-pointer"
            >
              <Phone size={18} strokeWidth={2.5} />
              Bizi Arayın
            </PhoneLink>
            <a 
              href="/iletisim"
              className="flex items-center gap-3 bg-white border border-black/5 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all hover:scale-105 shadow-lg shadow-black/5"
            >
              <MessageSquare size={18} strokeWidth={2.5} />
              Form Gönderin
            </a>
          </div>
        </div>
      </section>

      {/* FAQs List */}
      <div className="-mt-16 md:-mt-24">
        <StructuredData id="faq-page-schema" data={faqSchema || {}} />
        <FaqSection 
          faqs={faqs} 
          title="Tüm Teknik Sorular ve Yanıtlar" 
          badge="Kapsamlı S.S.S"
        />
      </div>

      {/* Bottom Info - CTA Card */}
      <section className="container-boxed mt-20 mb-20">
        <div className="relative bg-white border border-black/5 rounded-[40px] p-12 md:p-20 text-center shadow-2xl shadow-blue-600/5 overflow-hidden group">
          {/* Animated Background Decor */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-600/5 blur-[100px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          
          <div className="relative z-10 max-w-[700px] mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter mb-6 italic leading-tight">
              Aradığınız Cevabı <br />
              <span className="text-blue-600">Bulamadınız mı?</span>
            </h2>
            <p className="text-lg md:text-xl text-black/50 font-medium mb-12 leading-relaxed">
              Teknik ekibimiz projenize özel soruları yanıtlamak ve ücretsiz keşif süreci başlatmak için hazır bekliyor.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6">
              <PhoneLink 
                phone={phoneVal}
                source="faq-bottom-cta"
                className="group/btn relative flex items-center gap-4 bg-blue-600 text-white px-10 py-6 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-2xl shadow-blue-600/20 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                <Phone size={20} strokeWidth={2.5} className="relative z-10" />
                <span className="relative z-10">{phoneVal}</span>
              </PhoneLink>
            </div>
            
            <div className="mt-8 text-black/30 text-[10px] font-black uppercase tracking-[0.3em]">
              Hafta içi 09:00 - 18:00 Arası Teknik Destek
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
