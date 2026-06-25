'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, Phone } from 'lucide-react';
import Breadcrumbs from '@/shared/layout/Breadcrumbs';
import PhoneLink from '@/shared/layout/PhoneLink';
import { toTurkishTitleCase } from '@/modules/seo/lib/service-utils';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import { CONTENT_BEFORE_RENDER, CONTENT_INJECT_SECTION } from '@/core/hooks/hooks';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { Service } from '@/core/types';
import ServiceCalculatorBlock from '@/modules/content/components/ServiceCalculatorBlock';
import { parseOsbList, parseIndustryProfile, buildClimateText } from '@/modules/content/lib/calculator-utils';
import type { LocationMetadata } from '@/lib/data-pseo';

interface ServiceCalculatorTemplateProps {
  service: Service;
  cityName: string;
  citySlug?: string;
  heroDescription: string;
  customContent: string;
  siteUrl?: string;
  metadata?: LocationMetadata | null;
}

export default function ServiceCalculatorTemplate({
  service,
  cityName,
  citySlug,
  heroDescription,
  customContent,
  siteUrl,
  metadata,
}: ServiceCalculatorTemplateProps) {
  const { settings } = useSettings();

  React.useEffect(() => {
    HookRegistry.doAction(CONTENT_BEFORE_RENDER, {
      template: 'ServiceCalculatorTemplate',
      service,
      cityName,
      settings,
    });
  }, [service, cityName, settings]);

  const injectedSections = HookRegistry.applyFilters<any>(CONTENT_INJECT_SECTION, {
    hero: { title: service.title, description: '' },
    content: { customContent },
    calculator: null,
  }, { service, cityName, settings, template: 'ServiceCalculatorTemplate' });

  const calculatorSection = injectedSections.calculator as { enabled?: boolean } | null;

  const osbList = parseOsbList(metadata);
  const industryProfile = parseIndustryProfile(metadata);
  const climateText = buildClimateText(metadata);

  const pageTitle = `${cityName} ${service.title} m² Fiyat Teklifi`;
  const mapTitle = toTurkishTitleCase(cityName);

  return (
    <main className="bg-[#f8f9fa] min-h-screen pt-24 pb-16 px-4">
      <div className="container-boxed bg-white relative overflow-hidden">
        <section className="relative z-10 p-6 md:p-12 border-b border-[var(--border-subtle)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-12 items-center">
            <div>
              <div className="mb-10">
                <Breadcrumbs
                  siteUrl={siteUrl}
                  crumbs={[
                    { label: 'Hizmetler', href: '/#hizmetler' },
                    { label: service.title, href: `/hizmetler/${service.slug}` },
                    ...(citySlug ? [{ label: cityName, href: `/hizmetler/${service.slug}/${citySlug}` }] : []),
                    { label: 'm² Fiyat Teklifi' },
                  ]}
                />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-[2px] bg-blue-600" />
                <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">
                  {mapTitle} {service.title} m² Fiyat Teklifi
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-950 leading-tight mb-6">
                {pageTitle}
              </h1>

              <div className="max-w-3xl text-slate-600 text-base md:text-lg leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: heroDescription || customContent }} />

              <div className="mt-10 flex flex-wrap gap-3">
                <PhoneLink
                  phone={settings?.phone || ''}
                  href={`tel:${String(settings?.phone || '').replace(/\s/g, '')}`}
                  source="service-calculator-hero"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition"
                >
                  <Phone size={18} /> Şimdi Ara
                </PhoneLink>
                <Link
                  href="/iletisim"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-slate-200 text-slate-900 rounded-3xl font-black uppercase tracking-[0.2em] hover:border-black transition"
                >
                  Detaylı Teklif Al <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {metadata ? (
              <div className="rounded-[32px] border border-blue-100 bg-blue-50 p-8 shadow-sm">
                <h2 className="text-xl font-black text-blue-900 mb-4">{cityName} için bölgesel veri</h2>
                <p className="text-base leading-relaxed text-blue-800 mb-4">{climateText}</p>
                {osbList.length > 0 ? (
                  <div className="mb-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-900 mb-2">Öne çıkan OSB'ler</h3>
                    <p className="text-sm text-blue-800">{osbList.slice(0, 4).join(', ')}{osbList.length > 4 ? ' ve diğer sanayi bölgelerinde hizmet veriyoruz.' : '.'}</p>
                  </div>
                ) : null}
                {industryProfile ? (
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-900 mb-2">Bölge sektör profili</h3>
                    {Array.isArray(industryProfile) ? (
                      <p className="text-sm text-blue-800">{industryProfile.slice(0, 5).join(', ')}{industryProfile.length > 5 ? ' ve daha fazlası.' : '.'}</p>
                    ) : (
                      <p className="text-sm text-blue-800">{String(industryProfile)}</p>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-[40px] overflow-hidden border border-black/5 bg-slate-50 p-10 shadow-2xl">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Hizmet</p>
                  <p className="text-2xl font-black text-slate-900 mt-2">{service.title}</p>
                </div>
                <div className="rounded-3xl bg-blue-600/10 p-3">
                  <Calculator size={24} className="text-blue-600" />
                </div>
              </div>
              <div className="text-sm text-slate-500 leading-relaxed">
                Bu sayfa, {cityName} bölgesi için {service.title} hizmetine özel m² fiyat teklifi oluşturur.
              </div>
            </div>
          </div>
        </section>

        <section className="px-2 py-6 md:px-4 md:py-12 relative bg-[#fbfcff]/50">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_0.35fr] items-start">
            <div className="space-y-8">
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-4">Özel Proje Bilgileri</h2>
                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: customContent }} />
              </div>

              {calculatorSection?.enabled !== false ? (
                <ServiceCalculatorBlock
                  service={service}
                  metadata={metadata}
                  pageType="pseo"
                  cityName={cityName}
                />
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
