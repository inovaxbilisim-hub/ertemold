'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, X } from 'lucide-react';
import PhoneLink from '@/shared/layout/PhoneLink';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import type { Service, ThicknessPrice, ExtraService, ServiceCalculatorConfig, CalculatorPluginConfig, CalculatorPageType } from '@/core/types';
import type { LocationMetadata } from '@/lib/data-pseo';
import {
  normalizePlacement,
  isCalculatorPlacementAllowed,
  parseOsbList,
  parseIndustryProfile,
  parseServiceConfigs,
  formatCurrencyValue,
  getCurrencyLabel,
  buildClimateText,
} from '@/modules/content/lib/calculator-utils';

interface ServiceCalculatorBlockProps {
  service: Service;
  metadata?: LocationMetadata | null;
  pageType?: CalculatorPageType;
  cityName?: string;
  settings?: any;
}

export default function ServiceCalculatorBlock({
  service,
  metadata,
  pageType = 'service',
  settings,
}: ServiceCalculatorBlockProps) {
  const settingsContext = useSettings();
  const effectiveSettings = settings || settingsContext?.settings || {};
  const calculatorPluginConfig: Partial<CalculatorPluginConfig> = effectiveSettings?.plugin_configs?.['service-calculator'] || {};
  const isCalculatorPluginActive = Array.isArray(effectiveSettings?.active_plugins) && effectiveSettings.active_plugins.includes('service-calculator');
  const placement = normalizePlacement(calculatorPluginConfig.placement);
  const serviceId = service.slug || String(service.id || '');
  const selectedServices = Array.isArray(calculatorPluginConfig.enabled_services)
    ? calculatorPluginConfig.enabled_services.map(String)
    : [];
  const isServiceSelected = selectedServices.length === 0 || selectedServices.includes(serviceId);
  const showCalculator = isCalculatorPluginActive
    && calculatorPluginConfig.render_on_service_pages !== false
    && isServiceSelected
    && isCalculatorPlacementAllowed(pageType, placement);

  const rawServiceConfigs = Array.isArray(calculatorPluginConfig.service_configs)
    ? calculatorPluginConfig.service_configs as unknown[]
    : [];
  const serviceConfigs: ServiceCalculatorConfig[] = parseServiceConfigs(rawServiceConfigs);

  const availableServiceOptions = serviceConfigs.filter((config) => config.thickness_prices.length > 0);

  const defaultServiceSlug = availableServiceOptions.length > 0
    ? (availableServiceOptions.some((config) => config.service_slug === serviceId)
      ? serviceId
      : availableServiceOptions[0].service_slug)
    : '';

  const [selectedServiceSlug, setSelectedServiceSlug] = React.useState<string>(defaultServiceSlug);
  const [selectedThickness, setSelectedThickness] = React.useState<string>('');
  const [calculatorArea, setCalculatorArea] = React.useState('');
  const [selectedExtras, setSelectedExtras] = React.useState<string[]>([]);
  const [calculationRequested, setCalculationRequested] = React.useState(false);
  const [showResultScreen, setShowResultScreen] = React.useState(false);

  React.useEffect(() => {
    if (!selectedServiceSlug && availableServiceOptions.length > 0) {
      setSelectedServiceSlug(defaultServiceSlug);
    }
  }, [availableServiceOptions, defaultServiceSlug, selectedServiceSlug]);

  const currentServiceConfig = serviceConfigs.find((item) => item.service_slug === selectedServiceSlug);
  const globalExtraServices: ExtraService[] = Array.isArray(calculatorPluginConfig.extra_services)
    ? calculatorPluginConfig.extra_services
      .map((extraItem) => {
        const rawStr = String(extraItem?.value ?? 0).replace(',', '.').replace(/[^\d.-]/g, '');
        const numVal = parseFloat(rawStr);
        return {
          label: String(extraItem?.label || '').trim(),
          price: isNaN(numVal) ? 0 : numVal,
        };
      })
      .filter((extraItem) => extraItem.label.length > 0)
    : [];
  const effectiveThicknessOptions: ThicknessPrice[] = currentServiceConfig?.thickness_prices ?? [];
  const effectiveExtraServices: ExtraService[] = currentServiceConfig?.extra_services?.length
    ? currentServiceConfig.extra_services
    : globalExtraServices;
  const calculatorPrice = selectedThickness
    ? effectiveThicknessOptions.find((option) => option.label === selectedThickness)?.price
    : undefined;
  const areaRawStr = String(calculatorArea).replace(',', '.').replace(/[^\d.-]/g, '');
  const calculatorAreaNumber = parseFloat(areaRawStr) || 0;
  const calculatorTotal = calculatorPrice !== undefined && calculatorAreaNumber > 0
    ? calculatorAreaNumber * calculatorPrice
    : null;
  const extraServicesTotal = calculatorTotal !== null
    ? effectiveExtraServices.reduce((sum, extra) => selectedExtras.includes(extra.label) ? sum + extra.price * calculatorAreaNumber : sum, 0)
    : 0;
  const finalTotal = calculationRequested && calculatorTotal !== null
    ? calculatorTotal + extraServicesTotal
    : null;
  const canCalculate = !!selectedServiceSlug && !!selectedThickness && calculatorAreaNumber > 0 && calculatorPrice !== undefined;
  const calculatorButtonText = calculatorPluginConfig.button_text || service.calculator_button_text || 'Teklif Hesapla';
  const calculatorDisclaimer = calculatorPluginConfig.disclaimer || service.calculator_disclaimer;
  const calculatorResultTitle = String(calculatorPluginConfig.result_title || 'Net fiyat için lütfen bizimle iletişime geçin');
  const calculatorResultDescription = String(calculatorPluginConfig.result_description || 'Belirtilen değerler ön keşif sonrası kesinleşecektir. Minimum alan {minimum_area} m²dir. Net fiyat için lütfen bizimle iletişime geçin.');
  const calculatorResultCtaText = String(calculatorPluginConfig.result_cta_text || 'Hemen İletişime Geç');
  
  const minAreaRaw = String(calculatorPluginConfig.minimum_area ?? '0').replace(',', '.').replace(/[^\d.-]/g, '');
  const calculatorMinimumArea = parseFloat(minAreaRaw) || 0;
  
  const currency = typeof calculatorPluginConfig.currency === 'string' ? calculatorPluginConfig.currency : 'EUR';
  const currencyLabel = getCurrencyLabel(currency);
  const calculatorResultText = calculatorResultDescription
    .replace(/{minimum_area}/g, calculatorMinimumArea ? calculatorMinimumArea.toLocaleString('tr-TR') : '—')
    .replace(/{area}/g, calculatorAreaNumber ? calculatorAreaNumber.toLocaleString('tr-TR') : '—')
    .replace(/{service}/g, currentServiceConfig?.title || service.title || selectedServiceSlug)
    .replace(/{thickness}/g, selectedThickness || '—')
    .replace(/{price}/g, calculatorPrice !== undefined ? calculatorPrice.toLocaleString('tr-TR') : '—')
    .replace(/{currency}/g, currencyLabel);

  const osbList = parseOsbList(metadata);
  const industryProfile = parseIndustryProfile(metadata);
  const climateText = buildClimateText(metadata);

  const productSchema = finalTotal !== null ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${currentServiceConfig?.title || service.title} - ${selectedThickness}mm`,
    description: `m² fiyat teklifi: ${formatCurrencyValue(finalTotal, currency)}`,
    offers: {
      '@type': 'Offer',
      price: finalTotal,
      priceCurrency: currency === 'TL' ? 'TRY' : currency === 'USD' ? 'USD' : 'EUR',
      priceValidUntil: '2028-12-31',
      availability: 'https://schema.org/PreOrder',
    },
  } : null;

  if (!showCalculator) {
    return null;
  }

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 lg:p-8 shadow-xl shadow-slate-900/5">
      {productSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Hesaplayıcı</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Alan ve hizmete göre tahmini fiyatınızı öğrenin</h3>
        </div>
        <div className="rounded-3xl bg-slate-50 p-3 shadow-sm">
          <Calculator size={24} className="text-blue-600" />
        </div>
      </div>

      {metadata ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr] mb-8">
          <div className="rounded-[28px] border border-blue-100 bg-blue-50 p-6">
            <h4 className="text-base font-black text-blue-900 mb-3">Bölgesel iklim ve nem bilgisi</h4>
            <p className="text-sm leading-relaxed text-blue-800">{climateText}</p>
          </div>
          <div className="space-y-4">
            {osbList.length > 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <h4 className="text-sm font-black text-slate-950 mb-2">Öne çıkan OSB'ler</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{osbList.slice(0, 3).join(', ')}{osbList.length > 3 ? ' ve diğer sanayi bölgelerinde.' : '.'}</p>
              </div>
            ) : null}
            {industryProfile ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <h4 className="text-sm font-black text-slate-950 mb-2">Bölgesel sektör profili</h4>
                {Array.isArray(industryProfile) ? (
                  <p className="text-sm text-slate-600 leading-relaxed">{industryProfile.slice(0, 5).join(', ')}{industryProfile.length > 5 ? ' ve daha fazlası.' : '.'}</p>
                ) : typeof industryProfile === 'object' ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {Object.entries(industryProfile as Record<string, unknown>).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </p>
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">{String(industryProfile)}</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {availableServiceOptions.length === 0 ? (
        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-slate-600">
          <p className="font-black mb-2">Bu hizmet için hesaplayıcı yapılandırması bulunamadı.</p>
          <p className="text-sm">Yönetici panelinden fiyatlandırma bilgilerini ekleyerek hesaplayıcıyı etkinleştirebilirsiniz.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4">
              {availableServiceOptions.length > 1 ? (
                <div>
                  <label className="block text-xs uppercase tracking-[0.35em] text-slate-500 font-black mb-2">Hizmet</label>
                  <select
                    value={selectedServiceSlug}
                    onChange={(e) => {
                      setSelectedServiceSlug(e.target.value);
                      setSelectedThickness('');
                      setSelectedExtras([]);
                      setCalculationRequested(false);
                      setShowResultScreen(false);
                    }}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500"
                  >
                    {availableServiceOptions.map((option) => (
                      <option key={option.service_slug} value={option.service_slug}>
                        {option.title || option.service_slug}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="block text-xs uppercase tracking-[0.35em] text-slate-500 font-black mb-2">Alan (m²)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={calculatorArea}
                  onChange={(e) => {
                    setCalculatorArea(e.target.value);
                    setCalculationRequested(false);
                    setShowResultScreen(false);
                  }}
                  placeholder="Örn: 120"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Kalınlık</p>
                  <p className="text-[11px] text-slate-400 mt-1">Standart kullanım için 2 mm önerilir</p>
                </div>
                <span className="text-xs font-black text-slate-400">{effectiveThicknessOptions.length} seçenek</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {effectiveThicknessOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      setSelectedThickness(option.label);
                      setCalculationRequested(false);
                      setShowResultScreen(false);
                    }}
                    className={`rounded-2xl border px-3 py-2 text-sm font-black transition ${selectedThickness === option.label ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                  >
                    {option.label} mm
                  </button>
                ))}
              </div>
            </div>
          </div>

          {effectiveExtraServices.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Opsiyonel ek hizmetler</h4>
                <span className="text-xs text-slate-400">Alan başına ek fiyat</span>
              </div>
              <div className="grid gap-3">
                {effectiveExtraServices.map((extra) => {
                  const selected = selectedExtras.includes(extra.label);
                  return (
                    <button
                      key={extra.label}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? selectedExtras.filter((item) => item !== extra.label)
                          : [...selectedExtras, extra.label];
                        setSelectedExtras(next);
                        setCalculationRequested(false);
                        setShowResultScreen(false);
                      }}
                      className={`flex items-center justify-between gap-4 rounded-3xl border px-4 py-4 text-left transition ${selected ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-black text-sm ${selected ? 'text-white' : 'text-slate-900'}`}>{extra.label}</p>
                          {selected ? (
                            <span className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                              Seçili
                            </span>
                          ) : null}
                        </div>
                        <p className={`${selected ? 'text-slate-100' : 'text-slate-500'} text-xs mt-1`}>Kaplama öncesi zemin hazırlığı</p>
                      </div>
                      <span className={`text-sm font-black ${selected ? 'text-white' : 'text-blue-600'}`}>+{extra.price.toLocaleString('tr-TR')} {currencyLabel}/m²</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-[32px] border border-slate-200 bg-slate-50 p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Temel hizmet birim fiyatı</span>
                <span>{calculatorPrice !== undefined ? `${calculatorPrice.toLocaleString('tr-TR')} ${currencyLabel}/m²` : '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Temel hizmet toplam</span>
                <span>{calculatorTotal !== null ? formatCurrencyValue(calculatorTotal, currency) : '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Ek hizmetler toplam</span>
                <span>{formatCurrencyValue(extraServicesTotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
                <span>Toplam tahmin</span>
                <span className="font-black text-slate-900">
                  {finalTotal !== null ? formatCurrencyValue(finalTotal, currency) : (calculationRequested ? 'Geçersiz giriş' : 'Alan ve hizmet seç')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCalculationRequested(true);
                setShowResultScreen(true);
              }}
              disabled={!canCalculate}
              className={`mt-6 w-full rounded-3xl px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition ${canCalculate ? 'bg-slate-950 hover:bg-black' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              {calculatorButtonText}
            </button>
            {calculatorDisclaimer ? (
              <p className="mt-3 text-xs text-slate-500">{calculatorDisclaimer}</p>
            ) : null}
          </div>

          {showResultScreen ? (
            <div className="fixed inset-0 z-[10001] overflow-y-auto bg-slate-950/70 px-4 py-6 sm:px-6 sm:py-8">
              <div className="mx-auto max-w-xl rounded-[28px] bg-white p-5 sm:p-7 shadow-2xl shadow-slate-900/15 border border-slate-200 relative">
                <button
                  type="button"
                  onClick={() => setShowResultScreen(false)}
                  className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
                  aria-label="Kapat"
                >
                  <X size={18} />
                </button>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.35em] text-blue-600 font-black">Teklif Görünümü</p>
                    <h2 className="text-2xl font-black text-slate-950 leading-tight">{calculatorResultTitle}</h2>
                    <p className="text-sm leading-relaxed text-slate-600">{calculatorResultText}</p>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500 font-black mb-3">Seçilen Hizmet</p>
                      <p className="text-lg font-black text-slate-950 mb-2">{currentServiceConfig?.title || service.title}</p>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>Kalınlık: <span className="font-black text-slate-900">{selectedThickness || '—'} mm</span></p>
                        <p>Alan: <span className="font-black text-slate-900">{calculatorAreaNumber.toLocaleString('tr-TR')} m²</span></p>
                        <p>Birim fiyat: <span className="font-black text-slate-900">{calculatorPrice !== undefined ? `${calculatorPrice.toLocaleString('tr-TR')} ${currencyLabel}/m²` : '—'}</span></p>
                        <p>Ek hizmetler toplam: <span className="font-black text-slate-900">{formatCurrencyValue(extraServicesTotal, currency)}</span></p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500 font-black mb-3">Toplam Ön Tahmin</p>
                      <div className="text-3xl font-black text-slate-950 mb-3">{finalTotal !== null ? formatCurrencyValue(finalTotal, currency) : '—'}</div>
                      <p className="text-sm text-slate-500 leading-relaxed">Bu tutar, sahada yapılacak keşif ve proje sonrası kesinleşecektir.</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/iletisim"
                      className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-black text-white uppercase tracking-[0.2em] transition hover:bg-black"
                    >
                      {calculatorResultCtaText}
                    </Link>
                    <PhoneLink
                      phone={String(effectiveSettings?.phone || '')}
                      href={`tel:${String(effectiveSettings?.phone || '').replace(/\s/g, '')}`}
                      source="service-calculator"
                      className="inline-flex items-center justify-center rounded-3xl border border-slate-900 px-5 py-3 text-sm font-black text-slate-900 uppercase tracking-[0.2em] transition hover:bg-slate-100"
                    >
                      Hemen Arayın
                    </PhoneLink>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Bu teklif ekranı, hizmetinizin kapsamına özel olarak hazırlanmış olup net fiyat, saha keşfi ve proje gereksinimlerine göre doğrulanacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
