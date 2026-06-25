"use client";

import React, { useState } from 'react';
import { Reference } from '@/core/types';
import AdminImagePicker from '../AdminImagePicker';
import type { City } from '@/app/admin/hooks/useAdminData';

interface ReferenceFormProps {
  item: Partial<Reference>;
  sectors?: any[];
  cities?: City[];
  services?: any[];
  onUpdate: (item: Partial<Reference>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (path: string) => void) => void;
}

export default function ReferenceForm({ item, sectors = [], cities = [], services = [], onUpdate, onFileUpload: _onFileUpload }: ReferenceFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [aiNotes, setAiNotes] = useState(''); // Local state for field notes

  const handleAiGenerate = async () => {
    const missing = [];
    if (!item.name) missing.push('Kurum / Firma Adı');
    if (!item.sector) missing.push('Sektör');
    if (!item.city_name) missing.push('Şehir');
    if (!item.project_size) missing.push('Proje Boyutu');
    if (!item.service_slug) missing.push('İlgili Hizmet');

    if (missing.length > 0) {
      alert('Yapay zeka üretimi için şu donelerin girilmesi zorunludur:\n\n- ' + missing.join('\n- '));
      return;
    }

    setIsGenerating(true);
    try {
      const serviceName = services?.find(s => s.slug === item.service_slug)?.title || item.service_slug;
      
      let promptData = `Kurum: ${item.name}\nSektör: ${item.sector}\nŞehir: ${item.city_name}\nBoyut: ${item.project_size}m2\nHizmet: ${serviceName}`;
      if (item.project_date) promptData += `\nBaşlangıç: ${item.project_date}`;
      if (item.completion_date) promptData += `\nBitiş: ${item.completion_date}`;
      if (aiNotes) promptData += `\nSaha Notları / Özel Durum: ${aiNotes}`;

      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: promptData, type: 'reference_content' })
      });
      
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'API Hatası');

      if (responseData.success && responseData.data) {
        const ai = responseData.data;
        onUpdate({
          ...item,
          projectSummary: ai.projectSummary || item.projectSummary || '',
          description: ai.description || item.description || '',
          features: Array.isArray(ai.features) && ai.features.length > 0 ? ai.features : (item.features || []),
          challenge: ai.challenge || item.challenge || '',
          solution: ai.solution || item.solution || '',
          system_type: ai.system_type || item.system_type || '',
          application_type: ai.application_type || item.application_type || '',
          forklift_traffic: ai.forklift_traffic || item.forklift_traffic || '',
          concrete_type: ai.concrete_type || item.concrete_type || '',
          coating_thickness_mm: ai.coating_thickness_mm || item.coating_thickness_mm,
          coverage_rate_sqm_kg: ai.coverage_rate_sqm_kg || item.coverage_rate_sqm_kg,
          curing_time_hours: ai.curing_time_hours || item.curing_time_hours
        });
        
        // We do NOT change the wizard step here.
        // We stay on step 2 so the user can review the generated data.
      } else {
        throw new Error('AI geçerli veri döndürmedi.');
      }
    } catch (err: any) {
      alert(`Yapay zeka hatası: ${err.message || String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isStep1Valid = item.name && item.sector && item.city_name && item.project_size && item.service_slug;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Wizard Header / Steps Indicator */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        padding: '16px 24px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        {[
          { step: 1, title: 'Doneler', desc: 'Ham Veriler' },
          { step: 2, title: 'AI Üretim', desc: 'İçerik & Teknik' },
          { step: 3, title: 'Medya', desc: 'Görseller & Yayın' }
        ].map((s, idx) => (
          <div key={s.step} style={{ display: 'flex', alignItems: 'center', opacity: wizardStep === s.step ? 1 : 0.5, transition: 'opacity 0.3s' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: wizardStep >= s.step ? 'var(--primary-color)' : '#e2e8f0',
              color: wizardStep >= s.step ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', marginRight: '12px'
            }}>
              {s.step}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
            {idx < 2 && <div style={{ width: '40px', height: '2px', background: '#e2e8f0', margin: '0 20px' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* STEP 1: DONELER (Seed Data) */}
        {wizardStep === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>1. Tohum Veriler (Doneler)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Yapay zekanın bu projeyi kavrayabilmesi için temel bilgileri girin. Ne kadar detay verirseniz, o kadar zengin SEO ve teknik içerik üretilir.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Kurum / Firma Adı *</label>
                <input type="text" className="admin-input" value={item.name || ''} onChange={e => onUpdate({ ...item, name: e.target.value })} placeholder="Müşteri veya proje adı" />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Sektör *</label>
                <select className="admin-input" value={item.sector || ''} onChange={(e) => onUpdate({ ...item, sector: e.target.value })}>
                  <option value="">Sektör Seçin...</option>
                  {sectors?.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Şehir *</label>
                <select
                  className="admin-input"
                  value={item.city_slug || ''}
                  onChange={(e) => {
                    const selectedCity = cities.find(c => c.slug === e.target.value);
                    onUpdate({ ...item, city_slug: e.target.value, city_name: selectedCity?.name || '' });
                  }}
                >
                  <option value="">Şehir Seçin...</option>
                  {cities.map((city) => <option key={city.id} value={city.slug}>{city.name} ({city.plate_code})</option>)}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">İlgili Hizmet *</label>
                <select className="admin-input" value={item.service_slug || ''} onChange={(e) => onUpdate({ ...item, service_slug: e.target.value })}>
                  <option value="">Hizmet Seçin...</option>
                  {services?.map((s) => <option key={s.id} value={s.slug}>{s.title}</option>)}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Proje Boyutu (m²) *</label>
                <input type="number" className="admin-input" value={item.project_size || ''} onChange={e => onUpdate({ ...item, project_size: e.target.value ? Number(e.target.value) : null })} placeholder="Örn: 250" />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Proje Tarihi</label>
                <input type="date" className="admin-input" value={item.project_date ? item.project_date.split('T')[0] : ''} onChange={e => onUpdate({ ...item, project_date: e.target.value })} />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Bitiş Tarihi</label>
                <input type="date" className="admin-input" value={item.completion_date ? item.completion_date.split('T')[0] : ''} onChange={e => onUpdate({ ...item, completion_date: e.target.value })} />
              </div>

              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-label">Saha Notları / Özel Durumlar (AI İçin Çok Önemli)</label>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-4px', marginBottom: '8px' }}>
                  Örn: "Zemin çok ıslaktı, eski beton çatlamıştı, fabrikayı durdurmadan 3 günde bitirmemiz gerekiyordu."
                </p>
                <textarea 
                  className="admin-textarea" 
                  value={aiNotes} 
                  onChange={e => setAiNotes(e.target.value)} 
                  rows={3} 
                  placeholder="Buraya yazacağınız serbest metin, AI tarafından mükemmel bir Vaka Analizine (Case Study) dönüştürülecektir."
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button 
                onClick={(e) => { e.preventDefault(); setWizardStep(2); }}
                disabled={!isStep1Valid}
                className="admin-btn admin-btn-primary"
                style={{ padding: '12px 32px', opacity: isStep1Valid ? 1 : 0.5 }}
              >
                İleri: Yapay Zeka Aşaması ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AI ÜRETİM (Generation & Review) */}
        {wizardStep === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: '#166534' }}>AI İçerik ve Teknik Veri Fabrikası</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#15803d' }}>Girdiğiniz veriler analiz edilerek projenin SEO ve teknik şablonu oluşturulacak.</p>
              </div>
              <button 
                onClick={(e) => { e.preventDefault(); handleAiGenerate(); }}
                disabled={isGenerating}
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: 'none',
                  background: isGenerating ? '#94a3b8' : '#16a34a',
                  color: 'white',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isGenerating ? 'none' : '0 4px 6px -1px rgba(22, 163, 74, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {isGenerating ? '⏳ Üretiliyor (Lütfen Bekleyin)...' : '✨ Tüm Detayları Otomatik Üret'}
              </button>
            </div>

            <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Üretilen İçeriği İncele (Manuel Düzeltme Yapabilirsiniz)</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Kolon 1: SEO ve Metinler */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Proje Özeti</label>
                  <textarea className="admin-textarea" value={item.projectSummary || ''} onChange={e => onUpdate({ ...item, projectSummary: e.target.value })} rows={2} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Karşılaşılan Zorluk (Challenge)</label>
                  <textarea className="admin-textarea" value={item.challenge || ''} onChange={e => onUpdate({ ...item, challenge: e.target.value })} rows={3} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Uygulanan Çözüm (Solution)</label>
                  <textarea className="admin-textarea" value={item.solution || ''} onChange={e => onUpdate({ ...item, solution: e.target.value })} rows={3} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Uygulanan İşlemler (Maddeler)</label>
                  <textarea 
                    className="admin-textarea" 
                    value={(Array.isArray(item.features) ? item.features : []).join('\n')} 
                    onChange={e => onUpdate({ ...item, features: e.target.value.split('\n').filter(Boolean) })} 
                    rows={4} 
                    placeholder="Her satıra bir özellik yazın."
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Maddeleri satır satır alt alta düzenleyebilirsiniz.</p>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Detaylı Kapsam Açıklaması</label>
                  <textarea className="admin-textarea" value={item.description || ''} onChange={e => onUpdate({ ...item, description: e.target.value })} rows={4} />
                </div>
              </div>

              {/* Kolon 2: Teknik Özellikler */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
                <h5 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Tahmini Teknik Veriler</h5>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Sistem Tipi</label>
                    <select className="admin-input" value={item.system_type || ''} onChange={e => onUpdate({ ...item, system_type: e.target.value })}>
                      <option value="">Seçiniz...</option>
                      {services?.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Uygulama Tipi</label>
                    <select className="admin-input" value={item.application_type || ''} onChange={e => onUpdate({ ...item, application_type: e.target.value })}>
                      <option value="">Seçiniz...</option>
                      <option value="Rulo Uygulama">Rulo Uygulama</option>
                      <option value="Mala Uygulaması">Mala Uygulaması</option>
                      <option value="Self-Leveling (Kendiliğinden Yayılan)">Self-Leveling (Kendiliğinden Yayılan)</option>
                      <option value="Püskürtme">Püskürtme</option>
                      <option value="Spatula Uygulaması">Spatula Uygulaması</option>
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Forklift / Araç Trafiği</label>
                    <select className="admin-input" value={item.forklift_traffic || ''} onChange={e => onUpdate({ ...item, forklift_traffic: e.target.value })}>
                      <option value="">Seçiniz...</option>
                      <option value="Yok">Yok</option>
                      <option value="Az">Az</option>
                      <option value="Orta">Orta</option>
                      <option value="Yoğun">Yoğun</option>
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Beton Tipi</label>
                    <select className="admin-input" value={item.concrete_type || ''} onChange={e => onUpdate({ ...item, concrete_type: e.target.value })}>
                      <option value="">Seçiniz...</option>
                      <option value="C20">C20</option>
                      <option value="C25">C25</option>
                      <option value="C30">C30</option>
                      <option value="C35">C35</option>
                      <option value="Yüzey Sertleştiricili">Yüzey Sertleştiricili</option>
                      <option value="Şap">Şap</option>
                      <option value="Eski/Yıpranmış Beton">Eski/Yıpranmış Beton</option>
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Kalınlık (mm)</label>
                    <select className="admin-input" value={item.coating_thickness_mm || ''} onChange={e => onUpdate({ ...item, coating_thickness_mm: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">Seçiniz...</option>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} mm</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Tüketim (m²/kg)</label>
                    <select className="admin-input" value={item.coverage_rate_sqm_kg || ''} onChange={e => onUpdate({ ...item, coverage_rate_sqm_kg: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">Seçiniz...</option>
                      {Array.from({ length: 71 }, (_, i) => (1 + i * 0.1).toFixed(1)).map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                      <option value="8.1">8+</option>
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Kürlenme (Saat)</label>
                    <input type="number" className="admin-input" value={item.curing_time_hours || ''} onChange={e => onUpdate({ ...item, curing_time_hours: e.target.value ? Number(e.target.value) : null })} placeholder="Örn: 24" />
                  </div>
                  
                  <div className="admin-form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '24px', margin: 0, marginTop: '8px' }}>
                    <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                      <input type="checkbox" checked={!!item.moisture_problem} onChange={e => onUpdate({ ...item, moisture_problem: e.target.checked })} />
                      Nem Problemi Vardı
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={(e) => { e.preventDefault(); setWizardStep(1); }} className="admin-btn admin-btn-secondary">
                🡄 Geri Dön
              </button>
              <button onClick={(e) => { e.preventDefault(); setWizardStep(3); }} className="admin-btn admin-btn-primary" style={{ padding: '12px 32px' }}>
                İleri: Görseller ve Yayın ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MEDYA & YAYIN */}
        {wizardStep === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>3. Görseller ve Yayına Alma</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>İçerikleriniz hazır! Şimdi projeye ait görselleri yükleyerek referansınızı aktif hale getirebilirsiniz.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <AdminImagePicker value={item.logoPath || ''} onChange={(path) => onUpdate({ ...item, logoPath: path })} label="Firma Logosu" />
                  <AdminImagePicker value={item.featuredImageUrl || ''} onChange={(path) => onUpdate({ ...item, featuredImageUrl: path })} label="Öne Çıkan Görsel" />
                  <AdminImagePicker value={item.beforeImageUrl || ''} onChange={(path) => onUpdate({ ...item, beforeImageUrl: path })} label="Öncesi (Before)" />
                  <AdminImagePicker value={item.afterImageUrl || ''} onChange={(path) => onUpdate({ ...item, afterImageUrl: path })} label="Sonrası (After)" />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Ana Video URL (YouTube / Vimeo) - Opsiyonel</label>
                <input type="url" className="admin-input" value={item.primary_video_url || ''} onChange={e => onUpdate({ ...item, primary_video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={!!item.active} 
                      onChange={e => onUpdate({ ...item, active: e.target.checked })} 
                      style={{ width: '20px', height: '20px' }}
                    />
                    Projeyi Sitede Yayına Al (Aktif Et)
                  </label>
                  <p style={{ margin: '8px 0 0 32px', fontSize: '13px', color: 'var(--text-muted)' }}>İşareti kaldırırsanız proje taslak olarak kalır, ziyaretçiler göremez.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={(e) => { e.preventDefault(); setWizardStep(2); }} className="admin-btn admin-btn-secondary">
                🡄 Geri Dön
              </button>
              {/* Formun dışındaki asıl "Kaydet" butonu Modal footer'ında, o yüzden kullanıcıya bilgi verelim */}
              <div style={{ color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                ✓ İşlem tamam! Formun altındaki "Kaydet" butonuna basabilirsiniz.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
