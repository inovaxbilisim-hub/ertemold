'use client';

import { Edit2, Plus, Trash2, HelpCircle, Layout, Save, Sparkles, Zap } from 'lucide-react';
import type { FAQ, SiteSettings } from '@/core/types';
import { SettingsCard, CheckboxField, TextField } from '../settings/SharedFields';

interface FaqTabSectionsProps {
  faqs: FAQ[];
  settings: SiteSettings | null;
  saving: boolean;
  onUpdateSettings: (settings: SiteSettings) => void;
  onSaveSettings: () => void;
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onToggleActive?: (faq: FAQ) => void;
}

const PAGE_OPTIONS = [
  { id: 'home', label: 'Anasayfa' },
  { id: 'services', label: 'Tüm Hizmet Sayfaları' },
  { id: 'pseo', label: 'Tüm pSEO Sayfaları' },
  { id: 'kurumsal', label: 'Kurumsal Sayfası' },
  { id: 'contact', label: 'İletişim Sayfası' },
  { id: 'branches', label: 'Şube Sayfaları' },
  { id: 'references', label: 'Referanslar' },
  { id: 'sectors', label: 'Sektör Sayfaları' },
];

export default function FaqTabSections({ 
  faqs, 
  settings, 
  saving, 
  onUpdateSettings, 
  onSaveSettings, 
  onEdit, 
  onDelete, 
  onCreate,
  onToggleActive: _onToggleActive
}: FaqTabSectionsProps) {
  
  const currentVisibility = settings?.faq_visibility || [];

  const togglePage = (pageId: string) => {
    if (!settings) return;
    const next = currentVisibility.includes(pageId)
      ? currentVisibility.filter(id => id !== pageId)
      : [...currentVisibility, pageId];
    
    onUpdateSettings({
      ...settings,
      faq_visibility: next
    });
  };

  const updateSetting = (key: keyof SiteSettings, value: any) => {
    if (!settings) return;
    onUpdateSettings({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="admin-card-list-stack">
      {/* Smart FAQ Engine Section */}
      <section className="admin-card mb-8 border-accent-blue/20 bg-accent-blue/5">
        <div className="admin-card-header mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-blue rounded-lg text-white">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-accent-blue">Smart FAQ Motoru (pSEO)</h2>
              <p className="text-xs text-accent-blue/60">Veritabanındaki hizmet verilerini kullanarak otomatik SSS üretir.</p>
            </div>
          </div>
          <button 
            onClick={onSaveSettings} 
            disabled={saving}
            className="admin-btn admin-btn-primary"
          >
            <Save size={16} /> {saving ? 'Kaydediliyor...' : 'Motoru Güncelle'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <SettingsCard title="Motor Durumu">
              <CheckboxField
                id="geo-faq-enabled"
                label="Dinamik FAQ Schema Üretimini Etkinleştir"
                checked={settings?.geo_faq_enabled ?? true}
                onChange={(val) => updateSetting('geo_faq_enabled', val)}
              />
              <p className="text-[11px] text-muted mt-2">
                Bu özellik açık olduğunda, pSEO sayfalarında hizmet özelliklerine (Features) dayalı otomatik sorular üretilir.
              </p>
            </SettingsCard>

            <SettingsCard title="İçerik Stili">
               <TextField 
                label="SSS Üretim Promptu (AI)"
                 value={settings?.geo_prompt_faq || ''}
                 onChange={(val) => updateSetting('geo_prompt_faq', val)}
                multiline
                rows={4}
                placeholder="Örn: Teknik terimleri kullanarak, kurumsal bir dille yanıtlar üret..."
               />
            </SettingsCard>
          </div>

          <div className="bg-white/50 rounded-2xl p-6 border border-white">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-accent-blue" />
              Nasıl Çalışır?
            </h3>
            <ul className="space-y-3 text-xs text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-accent-blue font-bold">1.</span>
                <span>Hizmetler sekmesindeki <strong>"Özellikler"</strong> listesini veri kaynağı olarak kullanır.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-blue font-bold">2.</span>
                <span>Lokasyon adını (İl/İlçe) soru kalıplarıyla birleştirerek benzersiz içerik oluşturur.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-blue font-bold">3.</span>
                <span>Google'ın <strong>FAQ Schema</strong> standartlarına %100 uyumlu JSON-LD çıktısı verir.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-blue font-bold">4.</span>
                <span>Manuel olarak aşağıda eklediğiniz sorularla birleşerek hibrit bir yapı sunar.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Visibility Settings */}
      <section className="admin-card mb-8">
        <div className="admin-card-header mb-4">
          <div className="flex items-center gap-2">
            <Layout size={20} className="text-accent-blue" />
            <h2 className="text-lg font-bold">Manuel SSS Görünürlük Ayarları</h2>
          </div>
          <button 
            onClick={onSaveSettings} 
            disabled={saving}
            className="admin-btn admin-btn-primary"
          >
            <Save size={16} /> {saving ? 'Kaydediliyor...' : 'Görünürlüğü Kaydet'}
          </button>
        </div>
        <p className="text-sm text-muted mb-6">
          Sıkça sorulan sorular bölümünün hangi dinamik sayfalarda otomatik olarak gösterileceğini seçin.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAGE_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 p-4 border border-subtle rounded-xl cursor-pointer hover:bg-subtle/5 transition-colors">
              <input 
                type="checkbox" 
                checked={currentVisibility.includes(opt.id)}
                onChange={() => togglePage(opt.id)}
                className="w-5 h-5 rounded border-subtle text-accent-blue focus:ring-accent-blue"
              />
              <span className="font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* FAQ List */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onCreate} className="admin-btn admin-btn-primary">
          <Plus size={16} /> Yeni Soru Ekle
        </button>
      </div>

      <div className="admin-card-grid">
        {faqs.map((item) => (
          <article key={item.id} className="admin-entity-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HelpCircle size={22} style={{ color: '#2563eb' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.question}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sıra: {item.sort_order}</span>
                    {item.category && (
                      <span style={{ padding: '1px 8px', borderRadius: 6, background: 'rgba(37,99,235,0.1)', color: '#2563eb', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => onEdit(item)} className="admin-btn admin-btn-sm" title="Düzenle">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(item.id)} className="admin-btn admin-btn-sm admin-btn-danger" title="Sil">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '10px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.answer}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 600, background: item.active ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)', color: item.active ? '#16a34a' : '#dc2626' }}>
                {item.active ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </article>
        ))}

        {faqs.length === 0 && (
          <div className="admin-empty" style={{ gridColumn: '1 / -1', border: '2px dashed #e2e8f0', borderRadius: 16 }}>
            <HelpCircle size={48} />
            <p>Henüz hiç soru tanımlanmamış.</p>
          </div>
        )}
      </div>
    </div>
  );
}
