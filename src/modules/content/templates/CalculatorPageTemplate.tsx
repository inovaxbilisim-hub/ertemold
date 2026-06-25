'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Phone,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Ruler,
  Layers,
  TrendingDown,
  Info,
  Wrench,
} from 'lucide-react';
import Breadcrumbs from '@/shared/layout/Breadcrumbs';
import PhoneLink from '@/shared/layout/PhoneLink';
import ServiceCalculatorBlock from '@/modules/content/components/ServiceCalculatorBlock';
import FaqSection from '@/modules/content/sections/FaqSection';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import type { Service, FAQ } from '@/core/types';

interface CalculatorPageTemplateProps {
  service: Service;
  faqs: FAQ[];
  settings: any;
  siteUrl?: string;
}

/* ------------------------------------------------------------------
   Fiyatı etkileyen faktörler — içerik stratejisi açısından hizmet
   sayfasından farklı; burada maliyet/hesaplama odaklı içerik var.
------------------------------------------------------------------ */
const PRICE_FACTORS = [
  {
    icon: Ruler,
    title: 'Alan Büyüklüğü',
    desc: 'Kapsamı m² cinsinden doğrudan etkiler. Daha büyük alanlar genellikle m² başına daha uygun fiyatlara sahip olur.',
    tip: 'En doğru ölçüm için tüm duvarlardan 10 cm içerde ölçün.',
  },
  {
    icon: Layers,
    title: 'Kalınlık Seçimi',
    desc: 'Standart kullanım için 2 mm, yoğun trafik için 3–5 mm önerilir. Her mm kalınlık m² maliyetini doğrudan etkiler.',
    tip: '2 mm standart ofisler için; 4 mm+ depo ve fabrikalar için idealdir.',
  },
  {
    icon: Wrench,
    title: 'Zemin Hazırlık Durumu',
    desc: 'Mevcut zemin pürüzsüzse hazırlık maliyeti düşer. Çatlak, nem veya eski kaplama varsa ek işlem gerekebilir.',
    tip: 'Zemin hazırlık maliyeti bazen toplam işin %20–30\'unu oluşturabilir.',
  },
  {
    icon: TrendingDown,
    title: 'Malzeme ve Uygulama',
    desc: 'Kullanılan epoksi kalitesi, katman sayısı ve uygulama yöntemi birim fiyatı belirler.',
    tip: 'Uygulamayı küçümsemeyin — doğru uygulama ömrü 3–5 kat artırır.',
  },
];

/* ------------------------------------------------------------------
   Hesaplama adımları — HowTo şemasıyla uyumlu
------------------------------------------------------------------ */
const HOW_TO_STEPS = [
  { num: '01', title: 'Alanı Ölçün', desc: 'Kaplanacak alanın uzunluk ve genişliğini metre cinsinden ölçün. Düzensiz alanlar için bölümlere ayırarak toplayın.' },
  { num: '02', title: 'Kalınlık Seçin', desc: 'Kullanım amacınıza göre kalınlık seçeneğini belirleyin. Standart için 2 mm, ağır kullanım için 3–5 mm önerilir.' },
  { num: '03', title: 'Ek Hizmetleri Ekleyin', desc: 'Zemin hazırlık, primer uygulama gibi ek hizmetleri seçerek toplam maliyeti daha gerçekçi hesaplayın.' },
  { num: '04', title: 'Teklif Alın', desc: 'Hesaplama sonrası tahmini fiyatınızı görün ve kesin teklif için bizimle iletişime geçin.' },
];

export default function CalculatorPageTemplate({
  service,
  faqs,
  siteUrl,
}: CalculatorPageTemplateProps) {
  const { settings } = useSettings();
  const phone = settings?.phone || '';
  const [activeFactor, setActiveFactor] = useState<number | null>(null);

  return (
    <main className="bg-[#f8f9fa] min-h-screen pt-24 pb-20">

      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section className="container-boxed bg-white rounded-[40px] shadow-sm border border-black/5 mb-8 overflow-hidden relative">
        {/* Dekoratif arka plan */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/[0.04] blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/[0.03] blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <div className="relative z-10 p-8 md:p-14">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumbs
              siteUrl={siteUrl}
              crumbs={[
                { label: 'Hizmetler', href: '/hizmetler' },
                { label: service.title, href: `/hizmetler/${service.slug}` },
                { label: 'm² Fiyat Hesaplama' },
              ]}
            />
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/15 text-blue-700 text-[11px] font-black uppercase tracking-[0.25em] mb-6">
                <Calculator size={13} strokeWidth={3} />
                Fiyat Hesaplama Aracı
              </div>

              {/* H1 */}
              <h1 className="text-3xl md:text-5xl font-black text-slate-950 leading-tight mb-5 tracking-tight">
                {service.title}<br />
                <span className="text-blue-600">m² Fiyat Hesaplama</span>
              </h1>

              <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
                {service.calculator_description || `${service.title} uygulamasının tahmini maliyetini anlık hesaplayın. Alan büyüklüğü, kalınlık seçimi ve ek hizmetlere göre m² bazlı fiyat tahmini alın — kesin teklif için ekibimize ulaşın.`}
              </p>

              {/* İstatistik chips */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { label: 'Anlık hesaplama', icon: '⚡' },
                  { label: 'Ücretsiz', icon: '✓' },
                  { label: 'Taahhütsüz', icon: '🔓' },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                  >
                    {chip.icon} {chip.label}
                  </span>
                ))}
              </div>

              {/* CTA Butonları */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.15em] text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-600/20"
                >
                  <Calculator size={16} />
                  Hesaplamaya Başla
                </a>
                <PhoneLink
                  phone={phone}
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  source="calculator-page-hero"
                  className="inline-flex items-center gap-3 px-8 py-4 border-2 border-slate-200 text-slate-800 rounded-3xl font-black uppercase tracking-[0.15em] text-sm hover:border-slate-400 transition"
                >
                  <Phone size={16} />
                  Teklif Al
                </PhoneLink>
              </div>
            </div>

            {/* Sağ kart — hizmet özeti */}
            <div className="rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                  <Calculator size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">Hesaplama Aracı</p>
                  <p className="font-black text-white">{service.title}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Kalınlık seçeneğine göre fiyat',
                  'Ek hizmetler dahil hesaplama',
                  'Anlık tahmini maliyet görünümü',
                  'Kesin teklif için yönlendirme',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bu araç tahmini değerler sunar. Kesin fiyat saha keşfi sonrası belirlenir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FİYATI ETKİLEYEN FAKTÖRLER ────────────────────────── */}
      <section className="container-boxed bg-white rounded-[40px] shadow-sm border border-black/5 mb-8 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-[2px] bg-blue-600" />
            <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">Maliyet Rehberi</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-950 mb-3 tracking-tight">
            {service.title} Fiyatını Etkileyen Faktörler
          </h2>
          <p className="text-slate-500 text-base mb-10 max-w-2xl">
            Doğru hesaplama yapabilmek için bu faktörleri anlamak önemlidir. Her faktörün nasıl etki ettiğini öğrenin.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICE_FACTORS.map((factor, idx) => {
              const Icon = factor.icon;
              const isOpen = activeFactor === idx;
              return (
                <button
                  key={factor.title}
                  type="button"
                  onClick={() => setActiveFactor(isOpen ? null : idx)}
                  className={`text-left rounded-[24px] border p-6 transition-all duration-300 ${
                    isOpen
                      ? 'border-blue-200 bg-blue-50 shadow-md shadow-blue-600/10'
                      : 'border-slate-200 bg-slate-50 hover:border-blue-100 hover:bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isOpen ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <Icon size={18} className={isOpen ? 'text-white' : 'text-slate-600'} />
                  </div>
                  <h3 className={`font-black text-sm mb-2 ${isOpen ? 'text-blue-900' : 'text-slate-900'}`}>
                    {factor.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isOpen ? 'text-blue-800' : 'text-slate-500'}`}>
                    {factor.desc}
                  </p>
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-blue-200 flex items-start gap-2">
                      <Info size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-blue-700 leading-relaxed italic">{factor.tip}</p>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {isOpen ? 'Kapat' : 'Detay'}
                    <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── NASIL HESAPLANIR (HOW-TO) ──────────────────────────── */}
      <section className="container-boxed bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] shadow-xl mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-[2px] bg-blue-500" />
            <span className="text-blue-400 text-[11px] font-black uppercase tracking-[0.3em]">Adım Adım Rehber</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-10 tracking-tight">
            {service.title} m² Nasıl Hesaplanır?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_TO_STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="text-[48px] font-black text-white/5 leading-none mb-2 select-none">{step.num}</div>
                <h3 className="text-base font-black text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CALCULATOR WIDGET ──────────────────────────────────── */}
      <section className="container-boxed mb-8" id="calculator">
        <div className="bg-white rounded-[40px] shadow-sm border border-black/5 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-[2px] bg-blue-600" />
            <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">Anlık Hesaplama</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-950 mb-2 tracking-tight">
            {service.title} Fiyat Hesaplayıcı
          </h2>
          <p className="text-slate-500 text-base mb-8">
            Alan ve tercihlerinize göre tahmini maliyetinizi anında hesaplayın.
          </p>

          <ServiceCalculatorBlock
            service={service}
            pageType="calculator-page"
          />

          {/* Plugin aktif değilse alternatif CTA */}
          {!service.calculator_enabled && (
            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-8 text-center">
              <Calculator size={32} className="text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-3">Anlık Teklif Alın</h3>
              <p className="text-slate-500 text-base mb-6 max-w-md mx-auto">
                {service.title} için m² bazlı fiyat bilgisi almak üzere uzman ekibimizle iletişime geçin.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <PhoneLink
                  phone={phone}
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  source="calculator-page-no-plugin"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.15em] text-sm hover:bg-black transition"
                >
                  <Phone size={16} />
                  Hemen Ara
                </PhoneLink>
                <Link
                  href="/iletisim"
                  className="inline-flex items-center gap-3 px-8 py-4 border-2 border-slate-200 text-slate-800 rounded-3xl font-black uppercase tracking-[0.15em] text-sm hover:border-slate-400 transition"
                >
                  Form Gönderin <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── SSS / FAQ ──────────────────────────────────────────── */}
      {faqs && faqs.length > 0 && (
        <div className="container-boxed mb-8">
          <FaqSection
            faqs={faqs}
            title={`${service.title} Hakkında Sıkça Sorulan Sorular`}
            badge="Fiyat & Hesaplama SSS"
            ctaLabel="Tüm Soruları Gör"
            ctaLink="/sss"
          />
        </div>
      )}

      {/* ─── BOTTOM CTA ─────────────────────────────────────────── */}
      <section className="container-boxed">
        <div className="relative bg-white rounded-[40px] border border-black/5 shadow-sm p-10 md:p-16 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.04] blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-700 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
              <CheckCircle2 size={13} />
              Ücretsiz Keşif
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tight mb-4">
              Kesin Teklif İçin<br />
              <span className="text-blue-600">Bize Ulaşın</span>
            </h2>
            <p className="text-base text-slate-500 mb-8 leading-relaxed">
              Hesaplayıcı tahmini değerler verir. Kesin fiyat için saha keşfi gereklidir — ücretsiz keşif için hemen iletişime geçin.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <PhoneLink
                phone={phone}
                href={`tel:${phone.replace(/\s/g, '')}`}
                source="calculator-page-bottom-cta"
                className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.15em] text-sm hover:bg-blue-700 transition shadow-2xl shadow-blue-600/20"
              >
                <Phone size={18} />
                {phone || 'Hemen Ara'}
              </PhoneLink>
              <Link
                href={`/hizmetler/${service.slug}`}
                className="inline-flex items-center gap-3 px-10 py-5 border-2 border-slate-200 text-slate-700 rounded-[24px] font-black uppercase tracking-[0.15em] text-sm hover:border-slate-400 transition"
              >
                {service.title} Sayfası
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
