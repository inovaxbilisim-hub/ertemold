'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Clock, X } from 'lucide-react';
import type { Service, SiteSettings } from '@/core/types';
import { TIMELINE_ICON_OPTIONS } from './types';
import { resolveSectorSlug } from './utils';

interface AdvancedTabProps {
  item: Partial<Service>;
  sectors: any[];
  settings: SiteSettings | null | undefined;
  isCategory: boolean;
  onUpdate: (item: Partial<Service>) => void;
}

export default function AdvancedTab({ item, sectors, settings, isCategory, onUpdate }: AdvancedTabProps) {
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);

  // â”€â”€â”€ Timeline helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getTimeline = () => (item as any).timeline_stages || [];

  const addStage = () => {
    const stages = getTimeline();
    if (stages.length >= 8) {
      alert('Maksimum 8 aşama ekleyebilirsiniz.');
      return;
    }
    onUpdate({
      ...item,
      timeline_stages: [...stages, { day: stages.length + 1, title: '', description: '', icon: 'CheckCircle2' }],
    } as any);
  };

  const removeStage = (index: number) => {
    const stages = getTimeline()
      .filter((_: any, i: number) => i !== index)
      .map((s: any, i: number) => ({ ...s, day: i + 1 }));
    onUpdate({ ...item, timeline_stages: stages } as any);
  };

  const updateStage = (index: number, field: string, value: string | number) => {
    const stages = [...getTimeline()];
    stages[index] = { ...stages[index], [field]: value };
    onUpdate({ ...item, timeline_stages: stages } as any);
  };

  const moveStage = (index: number, dir: -1 | 1) => {
    const stages = [...getTimeline()];
    const target = index + dir;
    if (target < 0 || target >= stages.length) return;
    [stages[index], stages[target]] = [stages[target], stages[index]];
    onUpdate({ ...item, timeline_stages: stages.map((s: any, i: number) => ({ ...s, day: i + 1 })) } as any);
  };

  // â”€â”€â”€ Sector helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getCompatibleSectors = (): string[] => {
    const current = Array.isArray(item.compatible_sectors) ? item.compatible_sectors : [];
    return current.map(v => resolveSectorSlug(String(v), sectors)).filter(Boolean);
  };

  const toggleSector = (sectorSlug: string) => {
    const current = getCompatibleSectors();
    const next = current.includes(sectorSlug)
      ? current.filter(s => s !== sectorSlug)
      : [...current, sectorSlug];
    onUpdate({ ...item, compatible_sectors: next });
  };

  if (isCategory) {
    return (
      <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
        Kategori türünde hizmetler için gelişmiş seçenekler kullanılamaz.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* â”€â”€â”€ Timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10b981' }}>
              <Clock size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>Uygulama Süreç Aşamaları (Timeline)</h4>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                Referans sayfalarında gösterilir. <strong>Tanımlanacaksa en az 4, en fazla 8 aşama olmalıdır.</strong>
              </p>
            </div>
          </div>
          <button type="button" onClick={addStage} className="admin-btn admin-btn-sm" style={{ background: '#10b981', color: 'white', border: 'none' }}>
            <Plus size={14} /> Aşama Ekle
          </button>
        </div>

        {getTimeline().length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '13px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            ⚡ Timeline tanımlanmamış – referansta otomatik üretim kullanılacak.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {getTimeline().map((stage: any, idx: number) => (
            <div key={idx} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ background: '#10b981', color: 'white', fontWeight: 'bold', fontSize: '12px', padding: '2px 10px', borderRadius: '20px' }}>
                  {stage.day}. Gün
                </span>
                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                  <button type="button" onClick={() => moveStage(idx, -1)} disabled={idx === 0}
                    style={{ padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: idx === 0 ? '#cbd5e1' : '#475569', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" onClick={() => moveStage(idx, 1)} disabled={idx === getTimeline().length - 1}
                    style={{ padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: idx === getTimeline().length - 1 ? '#cbd5e1' : '#475569', cursor: idx === getTimeline().length - 1 ? 'not-allowed' : 'pointer' }}>
                    <ChevronDown size={14} />
                  </button>
                  <button type="button" onClick={() => removeStage(idx)}
                    style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Aşama Başlığı</label>
                  <input type="text" className="admin-input" value={stage.title || ''} onChange={e => updateStage(idx, 'title', e.target.value)} placeholder="Örn: Zemin Hazırlığı" />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">İkon</label>
                  <select className="admin-select" value={stage.icon || 'CheckCircle2'} onChange={e => updateStage(idx, 'icon', e.target.value)}>
                    {TIMELINE_ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">Açıklama</label>
                <textarea className="admin-textarea" value={stage.description || ''} onChange={e => updateStage(idx, 'description', e.target.value)} rows={2} placeholder="Bu aşamada yapılan işlemler..." />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* â”€â”€â”€ Uyumlu Sektörler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {sectors.length > 0 && (
        <div style={{ padding: '24px', backgroundColor: '#f0f9ff', borderRadius: '16px', border: '1px solid #bae6fd' }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 'bold', color: '#0369a1' }}>Uygulanabilir Sektörler</h4>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#0284c7' }}>
            Bu hizmetin hangi sektörlere uygun olduğunu seçin. Semantik olarak listelenir.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {getCompatibleSectors().map(slug => {
              const sec = sectors.find((s: any) => s.slug === slug);
              if (!sec) return null;
              return (
                <div key={slug} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#e0f2fe', borderRadius: '9999px', border: '1px solid #7dd3fc', fontSize: '13px', fontWeight: 600, color: '#0369a1' }}>
                  {sec.name}
                  <button type="button" onClick={() => toggleSector(slug)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: '#0284c7', display: 'flex', alignItems: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}

            {getCompatibleSectors().length === 0 && (
              <span style={{ fontSize: '13px', color: '#64748b' }}>Uyumlu sektör seçilmedi.</span>
            )}

            {/* Dropdown */}
            <div style={{ position: 'relative' }}>
              <button type="button" onClick={() => setShowSectorDropdown(!showSectorDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', border: '1px dashed #0284c7', background: 'white', color: '#0284c7', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={14} /> Sektör Ekle
              </button>

              {showSectorDropdown && (
                <>
                  <div onClick={() => setShowSectorDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50, minWidth: '220px', maxHeight: '260px', overflowY: 'auto', background: 'white', border: '1px solid #bae6fd', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '6px' }}>
                    {sectors.filter((s: any) => !getCompatibleSectors().includes(s.slug)).length === 0 ? (
                      <div style={{ padding: '10px 12px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Tüm sektörler eklendi.</div>
                    ) : (
                      sectors.filter((s: any) => !getCompatibleSectors().includes(s.slug)).map((sec: any) => (
                        <button key={sec.id} type="button" onClick={() => { toggleSector(sec.slug); setShowSectorDropdown(false); }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', borderRadius: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                          {sec.name}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ Hesaplayıcı â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(settings?.active_plugins?.includes('service-calculator') || item.calculator_enabled) && (
        <div style={{ padding: '24px', backgroundColor: '#fff7ed', borderRadius: '16px', border: '1px solid #ffedd5' }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 'bold', color: '#c2410c' }}>Hesaplayıcı Modülü</h4>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#ea580c' }}>
            Bu hizmet için mÂ² bazlı fiyat hesaplama aracını yönetin.
          </p>

          <div className="admin-form-group">
            <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!item.calculator_enabled} onChange={e => onUpdate({ ...item, calculator_enabled: e.target.checked })} />
              Hesaplayıcı Aktif
            </label>
          </div>

          {item.calculator_enabled && (
            <>
              <div className="admin-form-group">
                <label className="admin-label">Taban Fiyat (mÂ² / ₺ - Opsiyonel)</label>
                <input type="number" className="admin-input" value={item.calculator_price_per_sqm || ''}
                  onChange={e => onUpdate({ ...item, calculator_price_per_sqm: parseFloat(e.target.value) || 0 })}
                  placeholder="Örn: 250" />
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>SEO Product Schema için tahmini fiyat.</p>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Hesaplama Sayfası Özel SEO Metni</label>
                <textarea className="admin-textarea" value={item.calculator_description || ''}
                  onChange={e => onUpdate({ ...item, calculator_description: e.target.value })}
                  rows={3} placeholder="Sadece /hesaplama sayfasında görünür..." />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

