'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { CheckboxField, TextField } from '@/modules/admin/components/tabs/settings/SharedFields';
import { Settings, X, Save, Shield, HelpCircle, Layout, Layers, Plus } from 'lucide-react';
import { ZeminCheckupConfig } from '@/modules/admin/components/tabs/plugins/ZeminCheckupConfig';

type PluginPreset = 'core' | 'seo' | 'industry' | 'full';

const PRESETS: { key: PluginPreset; label: string; description: string; plugins: string[] }[] = [
  { key: 'core',     label: 'Temel',     description: 'Varsayılan, tüm sitelerde olmalı',     plugins: ['project-timeline'] },
  { key: 'seo',      label: 'SEO++',     description: 'SEO odaklı siteler',                   plugins: ['project-timeline', 'seo-aeo'] },
  { key: 'industry', label: 'Endüstri+', description: 'Sanayi/endüstri müşterileri',          plugins: ['project-timeline', 'zemin-checkup', 'service-calculator'] },
  { key: 'full',     label: 'Full',      description: 'Maksimum özellik',                     plugins: ['project-timeline', 'seo-aeo', 'zemin-checkup', 'service-calculator'] },
];

interface PluginExt {
  id: string;
  name?: string;
  description?: string;
  author?: string;
  version?: string;
  error?: string;
  configSchema?: {
    fields: {
      key: string;
      label: string;
      type: 'text' | 'textarea' | 'checkbox' | 'select' | 'number' | 'key_value';
      options?: { label: string; value: string }[];
      default?: any;
      helpText?: string;
    }[];
  };
}

interface ServiceCalculatorServiceConfig {
  service_slug: string;
  title?: string;
  thickness_prices?: { label: string; value: string | number }[];
  extra_services?: { label: string; value: string | number }[];
}

export default function PluginsPage() {
  const { settings, setSettings, fetchData: _fetchData, loading: settingsLoading, services: adminServices, sectors: adminSectors } = useAdminData(['settings', 'services', 'sectors']);
  const [plugins, setPlugins] = useState<PluginExt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlugin, setActivePlugin] = useState<PluginExt | null>(null);
  const [tempConfig, setTempConfig] = useState<Record<string, any>>({});
  const [calculatorStep, setCalculatorStep] = useState<number>(1);
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/admin/extensions?type=plugins')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPlugins(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Modüller yüklenemedi');
        setLoading(false);
      });
  }, []);

  const activePlugins = settings?.active_plugins || [];
  const pluginConfigs = settings?.plugin_configs || {};
  const services = adminServices.map((service) => ({
    id: service.id,
    slug: service.slug,
    title: service.title,
  }));
  const servicesLoading = settingsLoading;

  const serviceConfigs: ServiceCalculatorServiceConfig[] = Array.isArray(tempConfig.service_configs)
    ? tempConfig.service_configs
    : [];

  const activeServiceSlugs = Array.isArray(tempConfig.enabled_services)
    ? tempConfig.enabled_services.map(String)
    : [];

  const calculatorSteps = [
    { id: 1, title: 'Genel Ayarlar', description: 'Modülün genel yapılandırmasını ve kalınlık şablonlarını burada ayarlayın.' },
    { id: 2, title: 'Hizmetler', description: 'Seçili hizmetler için kalınlık ve fiyat yapılandırmasını yönetin.' },
    { id: 3, title: 'Opsiyonel Hizmetler', description: 'Ek hizmetleri ve ekstra hizmet fiyatlarını ekleyin.' },
    { id: 4, title: 'Diğer Ayarlar', description: 'Modülün yerleşim ve genel davranış ayarlarını yapılandırın.' },
    { id: 5, title: 'SEO & pSEO', description: 'm² fiyat teklifi sayfaları için SEO şablonlarını burada yönetin.' },
  ];

  const toggleServiceExpanded = (slug: string) => {
    setExpandedServices((current) => ({
      ...current,
      [slug]: !current[slug],
    }));
  };

  const updateServiceConfig = (slug: string, updater: (config: ServiceCalculatorServiceConfig) => ServiceCalculatorServiceConfig) => {
    const configs = Array.isArray(tempConfig.service_configs) ? [...tempConfig.service_configs] : [];
    const index = configs.findIndex((item) => String(item.service_slug) === slug);
    const current = index >= 0
      ? configs[index]
      : { service_slug: slug, title: services.find((item) => item.slug === slug)?.title || slug, thickness_prices: [], extra_services: [] };
    const updated = updater(current);

    if (index >= 0) {
      configs[index] = updated;
    } else {
      configs.push(updated);
    }

    setTempConfig({ ...tempConfig, service_configs: configs });
  };

  const handleToggle = async (pluginId: string, isChecked: boolean) => {
    if (!settings) return;
    
    // Optimistic update for instant feedback
    const originalSettings = { ...settings };
    let newActive = [...activePlugins];
    if (isChecked) {
      if (!newActive.includes(pluginId)) newActive.push(pluginId);
    } else {
      newActive = newActive.filter(id => id !== pluginId);
    }

    const updatedSettings = {
      ...settings,
      active_plugins: newActive
    };

    setSettings(updatedSettings);
    setSaving(true);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) throw new Error('Kayıt hatası');
      
      toast.success(`Modül ${isChecked ? 'aktif edildi' : 'kapatıldı'}.`);
    } catch {
      toast.error('Modül ayarı değiştirilirken hata oluştu.');
      setSettings(originalSettings); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  const openConfigModal = (plugin: PluginExt) => {
    setActivePlugin(plugin);
    setCalculatorStep(1);
    setExpandedServices({});
    const schemaDefaults = (plugin.configSchema?.fields || []).reduce((acc, field) => {
      if (field.default !== undefined) {
        acc[field.key] = field.default;
      }
      return acc;
    }, {} as Record<string, any>);
    setTempConfig({ ...schemaDefaults, ...(pluginConfigs[plugin.id] || {}) });
    setIsModalOpen(true);
  };

  const savePluginConfig = async () => {
    if (!settings || !activePlugin) return;
    setSaving(true);

    const updatedConfigs = {
      ...pluginConfigs,
      [activePlugin.id]: tempConfig
    };

    const updatedSettings = {
      ...settings,
      plugin_configs: updatedConfigs
    };

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) throw new Error('Kayıt hatası');
      
      toast.success(`${activePlugin.name} yapılandırması kaydedildi.`);
      setSettings(updatedSettings);
      setIsModalOpen(false);
    } catch {
      toast.error('Yapılandırma kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || settingsLoading) {
    return <div className="p-8 text-slate-500">Modüller yükleniyor...</div>;
  }

  return (
    <div className="p-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Modül ve Eklenti Yönetimi</h1>
          <p className="text-slate-500 mt-2 max-w-2xl font-medium">
            Sitenizin özelliklerini (Örn: Zemin Checkup, Smart FAQ vb.) buradan yönetebilirsiniz. 
            Kapalı modüllerin kodları sisteme yüklenmez, performans korunur.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
          <Shield size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Sistem Güvenli</span>
        </div>
      </div>

      <div className="mb-6 bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
             <Layers size={18} className="text-blue-500" />
             Hızlı Modül Seti (Preset)
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {PRESETS.map((preset) => {
              const isActivePreset = preset.plugins.every((p) => activePlugins.includes(p));
              const isPartial = preset.plugins.some((p) => activePlugins.includes(p)) && !isActivePreset;
              return (
                <button
                  key={preset.key}
                  onClick={async () => {
                    if (!settings) return;
                    // Mevcut active_plugins'ten diğer preset dışı plugin'leri koru,
                    // sadece bu preset'in plugin'lerini set et
                    const nonPresetPlugins = activePlugins.filter(
                      (p: string) => !PRESETS.some((pr) => pr.plugins.includes(p))
                    );
                    const newActive = [...new Set([...nonPresetPlugins, ...preset.plugins])];
                    const updated = { ...settings, active_plugins: newActive };
                    setSettings(updated);
                    setSaving(true);
                    try {
                      const res = await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updated),
                      });
                      if (!res.ok) throw new Error();
                      toast.success(`${preset.label} preset'i uygulandı.`);
                    } catch {
                      toast.error('Preset uygulanamadı.');
                      setSettings(settings);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                    isActivePreset
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                      : isPartial
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <span>{preset.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    isActivePreset ? 'text-blue-200' : isPartial ? 'text-yellow-500' : 'text-slate-400'
                  }`}>
                    {preset.plugins.length}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-3">
            Preset seçimi, mevcut aktif modüllerin üzerine ekleme yapar.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
             <Layout size={18} className="text-slate-400" />
             Yüklü Modüller ({plugins.length})
          </h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {plugins.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium italic">Henüz hiç modül bulunmuyor.</div>
          )}
          
          {plugins.map(plugin => {
            const isActive = activePlugins.includes(plugin.id);
            return (
              <div key={plugin.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-slate-50/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-black text-slate-800">{plugin.name || plugin.id}</h3>
                    {plugin.version && <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">v{plugin.version}</span>}
                    {plugin.error && <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg border border-red-100">Hatalı Kurulum</span>}
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">{plugin.description}</p>
                  <div className="text-[11px] font-bold text-slate-400 mt-4 flex items-center gap-4">
                    <span className="bg-slate-100 px-2 py-1 rounded-md tracking-tight">ID: {plugin.id}</span>
                    {plugin.author && <span>Yazar: {plugin.author}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-start md:self-center">
                  <button
                    onClick={() => openConfigModal(plugin)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-slate-600 border-2 border-slate-100 hover:border-slate-300 hover:bg-white transition-all text-sm"
                  >
                    <Settings size={18} />
                    Yapılandır
                  </button>
                  
                  <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl border-2 transition-all ${
                    isActive ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {isActive ? 'Aktif' : 'Pasif'}
                    </span>
                    <CheckboxField
                      id={`toggle-${plugin.id}`}
                      label=""
                      checked={isActive}
                      disabled={saving}
                      onChange={(checked) => handleToggle(plugin.id, checked)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Modal */}
      {isModalOpen && activePlugin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
          <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Settings size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-800">{activePlugin.name} Yapılandırması</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Modül Ayarları</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-5 max-h-[88vh] overflow-y-auto">
               <div className="space-y-5">
                  {activePlugin.id === 'service-calculator' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400 font-black">Adımlı Ayar</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                          {calculatorSteps.map((step) => (
                            <button
                              key={step.id}
                              type="button"
                              onClick={() => setCalculatorStep(step.id)}
                              className={`rounded-3xl border px-4 py-4 text-left transition ${calculatorStep === step.id ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200'}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-black">{step.id}. Adım</span>
                                <span className="text-[11px] uppercase tracking-[0.35em] text-slate-500 font-black">{step.title}</span>
                              </div>
                              <p className="text-[12px] text-slate-500 mt-2">{step.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {calculatorStep === 1 && (
                        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                              <h4 className="text-lg font-black text-slate-900">Genel Modül Ayarları</h4>
                              <p className="text-sm text-slate-500">Bu adımda modülün sabit ayarlarını yapılandırın.</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 w-full sm:w-auto">
                              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-slate-500 font-black">
                                Hizmet Sayfalarında Göster
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                  <CheckboxField
                                    id="modal-show-service-pages"
                                    checked={Boolean(tempConfig.render_on_service_pages)}
                                    label=""
                                    onChange={(checked) => setTempConfig({ ...tempConfig, render_on_service_pages: checked })}
                                  />
                                  <span>{tempConfig.render_on_service_pages ? 'Aktif' : 'Pasif'}</span>
                                </div>
                              </label>
                              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-slate-500 font-black">
                                Para Birimi
                                <select
                                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                  value={tempConfig.currency || 'EUR'}
                                  onChange={(e) => setTempConfig({ ...tempConfig, currency: e.target.value })}
                                >
                                  <option value="EUR">Euro (€)</option>
                                  <option value="TL">TL</option>
                                  <option value="USD">USD</option>
                                </select>
                              </label>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Buton Metni</label>
                              <input
                                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                value={tempConfig.button_text || 'Teklif Hesapla'}
                                onChange={(e) => setTempConfig({ ...tempConfig, button_text: e.target.value })}
                                placeholder="Örn: Teklif Hesapla"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Minimum Alan (m²)</label>
                              <input
                                type="number"
                                min={0}
                                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                value={tempConfig.minimum_area ?? 10}
                                onChange={(e) => setTempConfig({ ...tempConfig, minimum_area: Number(e.target.value) })}
                                placeholder="10"
                              />
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Teklif Sonuç Başlığı</label>
                              <input
                                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                value={tempConfig.result_title || ''}
                                onChange={(e) => setTempConfig({ ...tempConfig, result_title: e.target.value })}
                                placeholder="Örn: Net fiyat için lütfen bizimle iletişime geçin"
                              />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                              <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Teklif Sonuç Açıklaması</label>
                              <textarea
                                rows={3}
                                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                value={tempConfig.result_description || ''}
                                onChange={(e) => setTempConfig({ ...tempConfig, result_description: e.target.value })}
                                placeholder="Örn: Belirtilen değerler ön keşif sonrası kesinleşecektir. Minimum alan {minimum_area} m²dir."
                              />
                            </div>
                          </div>

                          <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2 flex items-center justify-between gap-4">
                              <div>
                                <h5 className="text-sm font-black text-slate-900">Ön Tanımlı Kalınlıklar</h5>
                                <p className="text-xs text-slate-500">Genel ayarlarda kullanılacak kalınlık şablonlarını burada ekleyin.</p>
                              </div>
                            </div>
                            {(Array.isArray(tempConfig.thickness_labels) ? tempConfig.thickness_labels : []).map((item: any, idx: number) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input
                                  className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                  placeholder="Kalınlık değeri"
                                  value={item?.label ?? item?.value ?? ''}
                                  onChange={(e) => {
                                    const next = [...(Array.isArray(tempConfig.thickness_labels) ? tempConfig.thickness_labels : [])];
                                    next[idx] = { label: e.target.value, value: e.target.value };
                                    setTempConfig({ ...tempConfig, thickness_labels: next });
                                  }}
                                />
                                <button
                                  type="button"
                                  className="h-11 w-11 rounded-2xl border border-slate-200 text-red-500 hover:bg-red-50 transition-colors"
                                  onClick={() => {
                                    const next = (Array.isArray(tempConfig.thickness_labels) ? tempConfig.thickness_labels : []).filter((_, i) => i !== idx);
                                    setTempConfig({ ...tempConfig, thickness_labels: next });
                                  }}
                                  aria-label="Satırı sil"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-3xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 border border-blue-100 hover:bg-blue-100 transition-all"
                              onClick={() => {
                                const next = [...(Array.isArray(tempConfig.thickness_labels) ? tempConfig.thickness_labels : []), { label: '', value: '' }];
                                setTempConfig({ ...tempConfig, thickness_labels: next });
                              }}
                            >
                              + Yeni Kalınlık Ekle
                            </button>
                          </div>
                        </div>
                      )}

                      {calculatorStep === 2 ? (
                        <div className="space-y-4">
                          {servicesLoading ? (
                            <div className="text-slate-500 text-sm">Hizmetler yükleniyor...</div>
                          ) : services.length === 0 ? (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Hizmet bulunamadı.</div>
                          ) : (
                            services.map((service) => {
                              const checked = activeServiceSlugs.length === 0 || activeServiceSlugs.includes(String(service.slug));
                              const expanded = expandedServices[service.slug] ?? checked;
                              const config = serviceConfigs.find((item) => String(item.service_slug) === service.slug) || {
                                service_slug: service.slug,
                                title: service.title,
                                thickness_prices: [],
                                extra_services: [],
                              };
                              const thicknessPrices = Array.isArray(config.thickness_prices) ? config.thickness_prices : [];

                              return (
                                <div key={service.slug || service.id} className="rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => toggleServiceExpanded(service.slug)}
                                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          const current = Array.isArray(tempConfig.enabled_services)
                                            ? tempConfig.enabled_services.map(String)
                                            : [];
                                          const next = e.target.checked
                                            ? [...new Set([...current, String(service.slug)])]
                                            : current.filter((item) => item !== String(service.slug));

                                          const nextConfig = { ...(tempConfig as Record<string, any>), enabled_services: next } as Record<string, any>;
                                          const currentServiceConfigs = Array.isArray(tempConfig.service_configs) ? [...tempConfig.service_configs] : [];

                                          if (e.target.checked) {
                                            if (!currentServiceConfigs.some((item) => String(item.service_slug) === service.slug)) {
                                              nextConfig.service_configs = [
                                                ...currentServiceConfigs,
                                                {
                                                  service_slug: service.slug,
                                                  title: service.title,
                                                  thickness_prices: [],
                                                  extra_services: [],
                                                },
                                              ];
                                            }
                                          } else {
                                            nextConfig.service_configs = currentServiceConfigs.filter((item) => String(item.service_slug) !== service.slug);
                                          }

                                          setTempConfig(nextConfig);
                                        }}
                                        className="mt-1 w-4 h-4 accent-blue-600"
                                      />
                                      <div>
                                        <div className="font-black text-slate-900">{service.title}</div>
                                        <div className="text-[11px] text-slate-500">{service.slug}</div>
                                      </div>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-black">{expanded ? 'Kapat' : 'Aç'}</span>
                                  </button>
                                  {expanded && checked ? (
                                    <div className="border-t border-slate-200 px-5 py-5 space-y-4">
                                      <div className="grid gap-3 sm:grid-cols-[1.8fr_auto] items-end">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                          <input
                                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                            placeholder="Kalınlık (mm)"
                                            value={thicknessPrices[0]?.label || ''}
                                            onChange={(e) => updateServiceConfig(service.slug, (current) => {
                                              const next = [...(current.thickness_prices ?? [])];
                                              if (next.length === 0) next.push({ label: '', value: '' });
                                              next[0] = { ...next[0], label: e.target.value };
                                              return { ...current, thickness_prices: next };
                                            })}
                                          />
                                          <input
                                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                            placeholder="Fiyat / m²"
                                            value={thicknessPrices[0]?.value || ''}
                                            onChange={(e) => updateServiceConfig(service.slug, (current) => {
                                              const next = [...(current.thickness_prices ?? [])];
                                              if (next.length === 0) next.push({ label: '', value: '' });
                                              next[0] = { ...next[0], value: e.target.value };
                                              return { ...current, thickness_prices: next };
                                            })}
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => updateServiceConfig(service.slug, (current) => ({
                                            ...current,
                                            thickness_prices: [...(current.thickness_prices ?? []), { label: '', value: '' }],
                                          }))}
                                          className="inline-flex items-center gap-2 rounded-3xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 hover:bg-blue-100 transition-all"
                                        >
                                          <Plus size={16} />
                                          Yeni Alan Ekle
                                        </button>
                                      </div>

                                      {thicknessPrices.length === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                          Bu hizmet için kalınlık ekleyin.
                                        </div>
                                      ) : null}

                                      {thicknessPrices.map((item, idx) => (
                                        <div key={idx} className="grid gap-2 sm:grid-cols-[1.2fr_0.9fr_auto] items-end">
                                          <input
                                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                            placeholder="Kalınlık (mm)"
                                            value={item.label || ''}
                                            onChange={(e) => updateServiceConfig(service.slug, (current) => {
                                              const next = [...(current.thickness_prices ?? [])];
                                              next[idx] = { ...next[idx], label: e.target.value };
                                              return { ...current, thickness_prices: next };
                                            })}
                                          />
                                          <input
                                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                            placeholder="Fiyat / m²"
                                            value={item.value || ''}
                                            onChange={(e) => updateServiceConfig(service.slug, (current) => {
                                              const next = [...(current.thickness_prices ?? [])];
                                              next[idx] = { ...next[idx], value: e.target.value };
                                              return { ...current, thickness_prices: next };
                                            })}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => updateServiceConfig(service.slug, (current) => {
                                              const next = [...(current.thickness_prices ?? [])];
                                              next.splice(idx, 1);
                                              return { ...current, thickness_prices: next };
                                            })}
                                            className="h-11 w-11 rounded-2xl border border-slate-200 text-red-500 hover:bg-red-50 transition-colors"
                                            aria-label="Satırı sil"
                                          >
                                            <X size={18} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })
                          )}
                        </div>
                      ) : calculatorStep === 3 ? (
                        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                          <h4 className="text-lg font-black text-slate-900 mb-4">Opsiyonel Ek Hizmetler</h4>
                          <div className="space-y-4">
                            {(Array.isArray(tempConfig.extra_services) ? tempConfig.extra_services : []).map((item: any, idx: number) => (
                              <div key={idx} className="grid gap-2 sm:grid-cols-[1.2fr_0.9fr_auto] items-end">
                                <input
                                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                  placeholder="Hizmet adı"
                                  value={item.label || ''}
                                  onChange={(e) => {
                                    const next = [...(Array.isArray(tempConfig.extra_services) ? tempConfig.extra_services : [])];
                                    next[idx] = { ...next[idx], label: e.target.value };
                                    setTempConfig({ ...tempConfig, extra_services: next });
                                  }}
                                />
                                <input
                                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                  placeholder="Fiyat / m²"
                                  value={item.value || ''}
                                  onChange={(e) => {
                                    const next = [...(Array.isArray(tempConfig.extra_services) ? tempConfig.extra_services : [])];
                                    next[idx] = { ...next[idx], value: e.target.value };
                                    setTempConfig({ ...tempConfig, extra_services: next });
                                  }}
                                />
                                <button
                                  type="button"
                                  className="h-11 w-11 rounded-2xl border border-slate-200 text-red-500 hover:bg-red-50 transition-colors"
                                  onClick={() => {
                                    const next = (Array.isArray(tempConfig.extra_services) ? tempConfig.extra_services : []).filter((_, i) => i !== idx);
                                    setTempConfig({ ...tempConfig, extra_services: next });
                                  }}
                                  aria-label="Satırı sil"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-3xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 hover:bg-blue-100 transition-all"
                              onClick={() => {
                                const next = [...(Array.isArray(tempConfig.extra_services) ? tempConfig.extra_services : []), { label: '', value: '' }];
                                setTempConfig({ ...tempConfig, extra_services: next });
                              }}
                            >
                              <Plus size={16} />
                              Yeni Satır Ekle
                            </button>
                            <p className="text-xs text-slate-500">Her satır için bir ek hizmet adı ve m² başına fiyat girin. Fiyat 0 olursa hizmet ücretsiz kabul edilir.</p>
                          </div>
                        </div>
                      ) : calculatorStep === 5 ? (
                        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                          <div>
                            <div className="flex items-center justify-between gap-3 mb-4">
                              <div>
                                <h4 className="text-lg font-black text-slate-900">SEO & pSEO Ayarları</h4>
                                <p className="text-sm text-slate-500">m² fiyat teklifi sayfaları için başlık, açıklama ve içerik şablonlarını yönetin.</p>
                              </div>
                              <span className="text-xs uppercase tracking-[0.3em] text-slate-500 font-black">Thin Content Önlemi</span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">m² Fiyat Sayfası Aktif</label>
                                <div className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                                  <CheckboxField
                                    id="seo-m2-price-page"
                                    label=""
                                    checked={Boolean(tempConfig.seo_enable_m2_price_page)}
                                    onChange={(checked) => setTempConfig({ ...tempConfig, seo_enable_m2_price_page: checked })}
                                  />
                                  <span className="text-sm text-slate-700">Aktif</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">URL Modu</label>
                                <select
                                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                  value={tempConfig.seo_content_mode || 'service_only'}
                                  onChange={(e) => setTempConfig({ ...tempConfig, seo_content_mode: e.target.value })}
                                >
                                  <option value="service_only">Sadece Hizmet</option>
                                  <option value="service_city">Hizmet + Şehir</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Başlık Şablonu</label>
                              <input
                                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                value={tempConfig.seo_page_title_template || '{service} m² fiyat teklifi'}
                                onChange={(e) => setTempConfig({ ...tempConfig, seo_page_title_template: e.target.value })}
                                placeholder="{service} m² fiyat teklifi"
                              />
                              <p className="text-xs text-slate-400">Kullanılabilir değişkenler: {'{service}'}, {'{city}'}, {'{category}'}, {'{currency}'}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Açıklama Şablonu</label>
                              <textarea
                                rows={3}
                                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                value={tempConfig.seo_page_description_template || '{city} için {service} m² fiyat teklifi alın. Hızlı keşif ve detaylı teklif.'}
                                onChange={(e) => setTempConfig({ ...tempConfig, seo_page_description_template: e.target.value })}
                                placeholder="{city} için {service} m² fiyat teklifi alın."
                              />
                              <p className="text-xs text-slate-400">Açıklama kısa ve özgün olmalı, özel şehir hizmet kombinasyonunda dinamik olmalı.</p>
                            </div>
                          </div>

                          <div className="grid gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Sayfa İçerik Şablonu</label>
                              <textarea
                                rows={5}
                                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                value={tempConfig.seo_page_body_template || '<p>{city} bölgesinde {service} m² fiyat teklifini hemen alın. Teknik keşif, hızlı dönüş ve profesyonel uygulama.</p>'}
                                onChange={(e) => setTempConfig({ ...tempConfig, seo_page_body_template: e.target.value })}
                                placeholder="Sayfa içeriği şablonu"
                              />
                              <p className="text-xs text-slate-400">Bu alan, her sayfada dinamik içerik üretmek için kullanılabilir. Thin content riskini azaltmak için uzun ve varyantlı içerik tercih edin.</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-black">Thin Content Koruması</label>
                              <textarea
                                rows={3}
                                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                value={tempConfig.seo_thin_content_warning || 'Şehir bazlı URL oluşturuluyorsa, içerik her şehir için özel ve anlamlı olmalıdır. Thin content ise şehir segmenti kaldırılabilir.'}
                                onChange={(e) => setTempConfig({ ...tempConfig, seo_thin_content_warning: e.target.value })}
                                placeholder="Thin content koruma uyarısı"
                              />
                                            <p className="text-xs text-slate-400">Buraya kısa not ekleyin; sistemde ince içerik oluşursa city derinliğini dışarıda bırakmak için kullanılabilir.</p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {activePlugin.id === 'zemin-checkup' && (
                    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm mb-6 mt-6">
                      <ZeminCheckupConfig tempConfig={tempConfig} setTempConfig={setTempConfig} />
                    </div>
                  )}

                  {activePlugin.configSchema?.fields?.length && (activePlugin.id !== 'service-calculator' || calculatorStep === 4) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                          <Layout size={18} className="text-blue-600" />
                          Modül Yapılandırması
                        </h4>
                      </div>

                      {activePlugin.configSchema.fields
                        .filter((field) => {
                          if (activePlugin.id !== 'service-calculator') return true;
                          return !['render_on_service_pages', 'currency', 'button_text', 'result_title', 'result_description', 'minimum_area', 'thickness_labels', 'extra_services'].includes(field.key);
                        })
                        .map((field) => {
                        let value = tempConfig[field.key] ?? field.default ?? (field.type === 'checkbox' ? false : (field.type === 'key_value' ? [] : ''));
                        
                        // JSON parsing fallback if key_value receives a string default from plugin.json
                        if (field.type === 'key_value' && typeof value === 'string') {
                           try { value = JSON.parse(value); } catch { value = []; }
                        }

                        if (field.key === 'thickness_labels') {
                          const labels = Array.isArray(value)
                            ? (value as any[]).map((item) => String(item?.label ?? item?.value ?? ''))
                            : [];

                          return (
                            <div key={field.key} className="md:col-span-2 flex flex-col gap-3">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                {field.label}
                              </label>
                              <div className="space-y-3">
                                {labels.map((label, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <input
                                      className="flex-1 bg-white border-2 border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 transition-all"
                                      placeholder="Kalınlık değeri"
                                      value={label}
                                      onChange={(e) => {
                                        const newLabels = [...labels];
                                        newLabels[idx] = e.target.value;
                                        setTempConfig({
                                          ...tempConfig,
                                          [field.key]: newLabels.map((item) => ({ label: item, value: item })),
                                        });
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="h-11 w-11 rounded-2xl border border-slate-200 text-red-500 hover:bg-red-50 transition-colors"
                                      onClick={() => {
                                        const next = labels.filter((_, i) => i !== idx);
                                        setTempConfig({
                                          ...tempConfig,
                                          [field.key]: next.map((item) => ({ label: item, value: item })),
                                        });
                                      }}
                                      aria-label="Satırı sil"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 border border-blue-100 hover:bg-blue-100 transition-all"
                                  onClick={() => {
                                    const next = [...labels, ''];
                                    setTempConfig({
                                      ...tempConfig,
                                      [field.key]: next.map((item) => ({ label: item, value: item })),
                                    });
                                  }}
                                >
                                  + Yeni Kalınlık Ekle
                                </button>
                              </div>
                              {field.helpText && (
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{field.helpText}</p>
                              )}
                            </div>
                          );
                        }

                        if (field.key === 'featured_sector_slugs' && activePlugin.id === 'sektorler') {
                          const selectedSlugs = (tempConfig.featured_sector_slugs || '').split(',').map((s: string) => s.trim()).filter(Boolean);
                          return (
                            <div key={field.key} className="md:col-span-2 flex flex-col gap-3">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                {field.label}
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {adminSectors.map((sector: any) => {
                                  const isSelected = selectedSlugs.includes(sector.slug);
                                  return (
                                    <div key={sector.id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-blue-300'}`} onClick={() => {
                                      let nextSelected = [...selectedSlugs];
                                      if (!isSelected) {
                                        nextSelected.push(sector.slug);
                                      } else {
                                        nextSelected = nextSelected.filter(s => s !== sector.slug);
                                      }
                                      setTempConfig({ ...tempConfig, [field.key]: nextSelected.join(',') });
                                    }}>
                                      <CheckboxField
                                        id={`sector-${sector.slug}`}
                                        label=""
                                        checked={isSelected}
                                        onChange={() => {}} // handled by parent div onClick
                                      />
                                      <div>
                                        <div className="font-bold text-slate-800 text-sm leading-tight">{sector.name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium mt-1">{sector.slug}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {field.helpText && (
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{field.helpText}</p>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div key={field.key} className={(field.type === 'textarea' || field.type === 'key_value') ? 'md:col-span-2 flex flex-col gap-2' : 'flex flex-col gap-2'}>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                              {field.label}
                            </label>
                            {field.type === 'text' && (
                              <input
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-bold text-slate-700 outline-none focus:border-blue-600 transition-all"
                                value={String(value)}
                                onChange={(e) => setTempConfig({ ...tempConfig, [field.key]: e.target.value })}
                              />
                            )}
                            {field.type === 'number' && (
                              <input
                                type="number"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-bold text-slate-700 outline-none focus:border-blue-600 transition-all"
                                value={Number(value || 0)}
                                onChange={(e) => setTempConfig({ ...tempConfig, [field.key]: Number(e.target.value) })}
                              />
                            )}
                            {field.type === 'textarea' && (
                              <textarea
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-bold text-slate-700 outline-none focus:border-blue-600 transition-all min-h-24"
                                rows={field.key.includes('json') ? 6 : 3}
                                value={String(value)}
                                onChange={(e) => setTempConfig({ ...tempConfig, [field.key]: e.target.value })}
                              />
                            )}
                            {field.type === 'select' && (
                              <select
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-bold text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none"
                                value={String(value)}
                                onChange={(e) => setTempConfig({ ...tempConfig, [field.key]: e.target.value })}
                              >
                                <option value="">Seçiniz</option>
                                {field.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                            {field.type === 'checkbox' && (
                              <div className="flex items-center justify-between gap-3 bg-slate-50 border-2 border-slate-100 rounded-2xl p-3">
                                <span className="font-bold text-slate-700 text-sm">{field.label}</span>
                                <CheckboxField
                                  id={field.key}
                                  label=""
                                  checked={Boolean(value)}
                                  onChange={(checked) => setTempConfig({ ...tempConfig, [field.key]: checked })}
                                />
                              </div>
                            )}
                            {field.type === 'key_value' && (
                              <div className="flex flex-col gap-2 bg-slate-50 border-2 border-slate-100 rounded-2xl p-3">
                                {(Array.isArray(value) ? value : []).map((item: any, idx: number) => (
                                  <div key={idx} className="flex gap-2 items-center">
                                    <input 
                                      className="flex-1 bg-white border-2 border-slate-200 rounded-xl p-2 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all" 
                                      placeholder="Hizmet" 
                                      value={item.label || ''} 
                                      onChange={(e) => {
                                        const newArr = [...(Array.isArray(value) ? value : [])];
                                        newArr[idx] = { ...newArr[idx], label: e.target.value };
                                        setTempConfig({ ...tempConfig, [field.key]: newArr });
                                      }}
                                    />
                                    <input 
                                      className="flex-[2] bg-white border-2 border-slate-200 rounded-xl p-2 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all" 
                                      placeholder="Fiyat" 
                                      value={item.value || ''} 
                                      onChange={(e) => {
                                        const newArr = [...(Array.isArray(value) ? value : [])];
                                        newArr[idx] = { ...newArr[idx], value: e.target.value };
                                        setTempConfig({ ...tempConfig, [field.key]: newArr });
                                      }}
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newArr = (Array.isArray(value) ? value : []).filter((_, i) => i !== idx);
                                        setTempConfig({ ...tempConfig, [field.key]: newArr });
                                      }}
                                      className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                                      title="Satırı Sil"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ))}
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newArr = [...(Array.isArray(value) ? value : []), { label: '', value: '' }];
                                    setTempConfig({ ...tempConfig, [field.key]: newArr });
                                  }}
                                  className="self-start text-[11px] font-black text-blue-700 bg-blue-100 px-3 py-2 rounded-xl hover:bg-blue-200 transition-colors uppercase tracking-widest mt-1"
                                >
                                  + Yeni Satır Ekle
                                </button>
                              </div>
                            )}
                            {field.helpText && (
                              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{field.helpText}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                          <Layout size={18} className="text-blue-600" />
                          Genel Yerleşim Ayarları
                        </h4>
                      </div>
                      <TextField
                        label="Özel Başlık (Opsiyonel)"
                        placeholder="Modül için özel bir başlık girin..."
                        value={tempConfig.customTitle || ''}
                        onChange={(val) => setTempConfig({...tempConfig, customTitle: val})}
                      />
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Listelenecek Sayfalar</label>
                        <select
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none"
                          value={tempConfig.placement || 'all'}
                          onChange={(e) => setTempConfig({...tempConfig, placement: e.target.value})}
                        >
                          <option value="all">Tüm Sayfalar</option>
                          <option value="pseo">Sadece pSEO Sayfaları</option>
                          <option value="service">Sadece Ana Hizmet Sayfaları</option>
                          <option value="home">Sadece Ana Sayfa</option>
                          <option value="none">Manuel (Sadece seçili sayfalarda)</option>
                        </select>
                      </div>
                      <div className="col-span-2 bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                            <HelpCircle size={20} />
                          </div>
                          <div>
                            <h5 className="font-black text-blue-900 text-sm mb-1">Genel Yerleşim Ayarları</h5>
                            <p className="text-xs text-blue-700/70 font-medium leading-relaxed">
                              Bu sayfa türü ayarı ile hesaplayıcının hizmet sayfalarında veya m² fiyat sayfalarında gösterilmesini kontrol edebilirsiniz.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
               </div>

            <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
               <div className="text-sm text-slate-500">Herhangi bir adımda yaptığınız değişiklikleri aşağıdan kaydedebilirsiniz.</div>
               <div className="flex items-center justify-end gap-3">
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                 >
                   Vazgeç
                 </button>
                 <button 
                  onClick={savePluginConfig}
                  disabled={saving}
                  className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                 >
                   <Save size={18} />
                   {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
