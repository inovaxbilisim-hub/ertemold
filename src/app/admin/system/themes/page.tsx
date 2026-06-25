'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { Palette, CheckCircle, Settings, X, Eye, RotateCcw } from 'lucide-react';

interface ThemeSettingField {
  key: string;
  label: string;
  type: 'text' | 'color' | 'select' | 'checkbox' | 'number' | 'range';
  default?: any;
  options?: { label: string; value: string }[];
  section: string;
  helpText?: string;
  placeholder?: string;
}

interface ThemeItem {
  id: string;
  name?: string;
  description?: string;
  author?: string;
  version?: string;
  active: boolean;
  isSystem: boolean;
  settings: Record<string, any>;
  screenshot?: string;
  settingsSchema?: Record<string, ThemeSettingField>;
  error?: string;
}

const SECTION_LABELS: Record<string, string> = {
  general: 'Genel',
  colors: 'Renkler',
  layout: 'Düzen',
  typography: 'Yazı Tipi',
  header: 'Üst Menü',
  footer: 'Altbilgi',
  custom: 'Özel',
};

const SECTION_ORDER = ['colors', 'layout', 'typography', 'header', 'footer', 'general', 'custom'];

export default function ThemesPage() {
  const { settings, setSettings } = useAdminData(['settings']);
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Customize Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeItem | null>(null);
  const [tempSettings, setTempSettings] = useState<Record<string, any>>({});

  const loadThemes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/extensions?type=themes');
      const data = await res.json();
      if (Array.isArray(data)) setThemes(data);
    } catch {
      toast.error('Temalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const activeThemeSlug = (settings?.uiContent as any)?.active_theme || 'default';

  const handleActivate = async (slug: string) => {
    if (!settings) return;
    if (slug === activeThemeSlug) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/themes/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) throw new Error('Aktivasyon hatası');

      toast.success(`"${slug}" teması aktif edildi. Yeni tasarımı görmek için sayfayı yenileyin.`);

      // Optimistic update
      const updatedSettings = {
        ...settings,
        uiContent: {
          ...(settings.uiContent as any || {}),
          active_theme: slug,
        },
      };
      setSettings(updatedSettings as any);
      setThemes(prev => prev.map(t => ({ ...t, active: t.id === slug })));
    } catch {
      toast.error('Tema değiştirilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const openCustomize = (theme: ThemeItem) => {
    setActiveTheme(theme);
    const defaults: Record<string, any> = {};
    if (theme.settingsSchema) {
      for (const [key, field] of Object.entries(theme.settingsSchema)) {
        defaults[key] = theme.settings?.[key] ?? field.default ?? '';
      }
    }
    setTempSettings(defaults);
    setModalOpen(true);
  };

  const saveThemeSettings = async () => {
    if (!activeTheme) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/themes/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: activeTheme.id, settings: tempSettings }),
      });

      if (!res.ok) throw new Error('Kayıt hatası');

      toast.success(`"${activeTheme.name}" tema ayarları kaydedildi.`);
      setThemes(prev => prev.map(t => t.id === activeTheme.id ? { ...t, settings: tempSettings } : t));
      setModalOpen(false);
    } catch {
      toast.error('Tema ayarları kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // Live preview: apply CSS variables to the preview card
  const previewStyle = activeTheme ? {
    '--preview-primary': tempSettings.primary_color || '#2563EB',
    '--preview-accent': tempSettings.accent_color || '#F97316',
    '--preview-teal': tempSettings.accent_teal || '#00d4aa',
    '--preview-radius': tempSettings.border_radius ? `${tempSettings.border_radius}px` : '16px',
  } as React.CSSProperties : {};

  if (loading) {
    return <div className="p-8 text-slate-500">Temalar yükleniyor...</div>;
  }

  const sortedThemes = [...themes].sort((a, b) => {
    if (a.id === 'default') return -1;
    if (b.id === 'default') return 1;
    if (a.active) return -1;
    if (b.active) return 1;
    return 0;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tema Yönetimi</h1>
          <p className="text-slate-500 mt-2 max-w-3xl font-medium">
            Sitenizin tasarımını tek bir tıkla değiştirin. Temalar CSS, bileşen yapısı ve düzeni tamamen
            değiştirebilir. Aktif tema anında tüm siteye yansır.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
          <Palette size={18} />
          <span className="text-xs font-black uppercase tracking-widest">{themes.length} Tema</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedThemes.map(theme => {
          const isActive = theme.active;
          const schemaFields = theme.settingsSchema ? Object.keys(theme.settingsSchema).length : 0;

          return (
            <div
              key={theme.id}
              className={`border rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col ${
                isActive
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Preview Area */}
              <div
                className="aspect-video bg-slate-100 flex items-center justify-center border-b border-black/5 relative overflow-hidden"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #2563eb10, #3b82f610)'
                    : undefined,
                }}
              >
                {theme.screenshot ? (
                  <img src={theme.screenshot} alt={theme.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Palette size={32} className="text-slate-300" />
                    <span className="text-slate-400 text-xs font-medium">Önizleme Yok</span>
                  </div>
                )}
                {isActive && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <CheckCircle size={12} />
                    AKTİF
                  </div>
                )}
                {theme.isSystem && !isActive && (
                  <div className="absolute top-4 left-4 bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    SİSTEM
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-slate-800">{theme.name || theme.id}</h3>
                  {theme.version && (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">
                      v{theme.version}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-2">
                  {theme.error ? <span className="text-red-500">{theme.description}</span> : theme.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-400">{theme.author}</span>

                  <div className="flex items-center gap-2">
                    {/* Customize button — only if theme has settings schema */}
                    {schemaFields > 0 && (
                      <button
                        onClick={() => openCustomize(theme)}
                        disabled={saving}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm flex items-center gap-1.5"
                        title="Özelleştir"
                      >
                        <Settings size={14} />
                        <span className="hidden sm:inline">Özelleştir</span>
                      </button>
                    )}

                    {/* Activate/Deactivate */}
                    {isActive ? (
                      <span className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-xl opacity-80 cursor-default flex items-center gap-1.5">
                        <CheckCircle size={14} />
                        Yayında
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivate(theme.id)}
                        disabled={saving}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        Aktifleştir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customize Modal */}
      {modalOpen && activeTheme && activeTheme.settingsSchema && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
          <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Palette size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">{activeTheme.name} — Özelleştir</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tema Ayarları</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body: Settings + Preview */}
            <div className="flex flex-1 overflow-hidden">
              {/* Settings Panel */}
              <div className="w-1/2 overflow-y-auto p-6 border-r border-slate-100">
                <div className="space-y-8">
                  {/* Group fields by section */}
                  {SECTION_ORDER.map(sectionKey => {
                    const sectionFields = Object.entries(activeTheme.settingsSchema!)
                      .filter(([_, field]) => field.section === sectionKey);

                    if (sectionFields.length === 0) return null;

                    return (
                      <div key={sectionKey}>
                        <h4 className="text-xs uppercase tracking-[0.3em] font-black text-slate-400 mb-4">
                          {SECTION_LABELS[sectionKey] || sectionKey}
                        </h4>
                        <div className="space-y-4">
                          {sectionFields.map(([key, field]) => (
                            <div key={key}>
                              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                {field.label}
                              </label>

                              {field.type === 'color' && (
                                <div className="flex items-center gap-3">
                                  <input
                                    type="color"
                                    value={tempSettings[key] || field.default || '#000000'}
                                    onChange={e => setTempSettings(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                                  />
                                  <input
                                    type="text"
                                    value={tempSettings[key] || ''}
                                    onChange={e => setTempSettings(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500"
                                  />
                                </div>
                              )}

                              {field.type === 'select' && field.options && (
                                <select
                                  value={tempSettings[key] ?? field.default ?? ''}
                                  onChange={e => setTempSettings(prev => ({ ...prev, [key]: e.target.value }))}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                                >
                                  {field.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              )}

                              {field.type === 'checkbox' && (
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(tempSettings[key] ?? field.default ?? false)}
                                    onChange={e => setTempSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                                    className="w-4 h-4 accent-blue-600"
                                  />
                                  <span className="text-sm text-slate-600">{field.helpText || ''}</span>
                                </label>
                              )}

                              {(field.type === 'text' || field.type === 'number') && (
                                <input
                                  type={field.type}
                                  value={tempSettings[key] ?? field.default ?? ''}
                                  onChange={e => setTempSettings(prev => ({ ...prev, [key]: e.target.value }))}
                                  placeholder={field.placeholder || ''}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                              )}

                              {field.helpText && field.type !== 'checkbox' && (
                                <p className="text-xs text-slate-400 mt-1">{field.helpText}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preview Panel */}
              <div className="w-1/2 overflow-y-auto p-6 bg-slate-50 flex items-start justify-center">
                <div
                  className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden transition-all"
                  style={previewStyle}
                >
                  {/* Preview Card Header */}
                  <div className="h-2" style={{ background: 'var(--preview-primary)' }} />
                  <div className="p-5 space-y-4">
                    {/* Simulated badge */}
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: 'color-mix(in srgb, var(--preview-primary) 10%, transparent)',
                        color: 'var(--preview-primary)',
                      }}
                    >
                      <Eye size={10} />
                      Önizleme
                    </div>

                    {/* Simulated title */}
                    <h3
                      className="text-lg font-black tracking-tight"
                      style={{
                        borderRadius: 'var(--preview-radius)',
                        color: 'var(--preview-primary)',
                      }}
                    >
                      Tema Önizleme
                    </h3>

                    {/* Simulated text */}
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Renk, düzen ve tipografi ayarlarınızın canlı önizlemesi burada görünür.
                      Değişiklikler kaydedildiğinde tüm siteye yansır.
                    </p>

                    {/* Simulated button */}
                    <button
                      className="w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all"
                      style={{
                        background: 'var(--preview-primary)',
                        borderRadius: 'var(--preview-radius)',
                      }}
                    >
                      Örnek Buton
                    </button>

                    {/* Simulated accent element */}
                    <div
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{
                        background: 'color-mix(in srgb, var(--preview-accent) 8%, transparent)',
                        borderRadius: 'var(--preview-radius)',
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--preview-accent)' }}
                      />
                      <span className="text-xs font-semibold" style={{ color: 'var(--preview-accent)' }}>
                        Vurgu Rengi Örneği
                      </span>
                    </div>

                    {/* Simulated teal accent */}
                    <div className="flex items-center gap-2 text-xs">
                      <span style={{ color: 'var(--preview-teal)' }}>●</span>
                      <span className="text-slate-400">Turkuaz vurgu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RotateCcw size={12} />
                Değişiklikler kaydedilene kadar geçerli değildir
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const defaults: Record<string, any> = {};
                    if (activeTheme.settingsSchema) {
                      for (const [key, field] of Object.entries(activeTheme.settingsSchema)) {
                        defaults[key] = field.default ?? '';
                      }
                    }
                    setTempSettings(defaults);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Sıfırla
                </button>
                <button
                  onClick={saveThemeSettings}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
