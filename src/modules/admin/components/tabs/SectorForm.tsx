"use client";

import { Sector } from '@/core/types';
import { AlertCircle, Sparkles, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminImagePicker from '../AdminImagePicker';

interface FAQ {
  question: string;
  answer: string;
}

interface SectorFormProps {
  item: Sector;
  onUpdate: (item: Sector) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, callback: (path: string) => void) => void;
}

export default function SectorForm({ item, onUpdate, onFileUpload: _onFileUpload }: SectorFormProps) {
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'exists' | 'available'>('idle');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generatingFaq, setGeneratingFaq] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/services')
      .then(res => res.json())
      .then(data => {
        if (data.data) setServicesList(data.data);
      })
      .catch(() => {});
  }, []);

  const handleAiGenerate = async () => {
    if (!item.name) {
      toast.error('Lütfen önce bir sektör adı girin.');
      return;
    }

    setGeneratingAi(true);
    let toastId = toast.loading(`"${item.name}" için içerik üretiliyor... (1/2)`);
    let currentItem = { ...item };

    try {
      // 1. Generate Info
      const res1 = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: currentItem.name, type: 'pseo_sector' })
      });
      const data1 = await res1.json();
      
      if (!data1.success) {
        throw new Error(data1.error || 'İçerik oluşturulamadı.');
      }

      const currentUiMetadata = (() => { try { return JSON.parse(currentItem.ui_metadata || '{}'); } catch { return {}; } })();
      
      currentItem = {
        ...currentItem,
        description: data1.data.description || currentItem.description || '',
        recommended_service_ids: data1.data.recommended_service_ids && data1.data.recommended_service_ids.length > 0 ? data1.data.recommended_service_ids : currentItem.recommended_service_ids,
        ui_metadata: JSON.stringify({
          ...currentUiMetadata,
          action_verb: data1.data.action_verb || currentUiMetadata.action_verb,
          service_suffix: data1.data.service_suffix || currentUiMetadata.service_suffix,
          value_prop: data1.data.value_prop || currentUiMetadata.value_prop,
          seo_title: data1.data.seo_title || currentUiMetadata.seo_title,
          seo_description: data1.data.seo_description || currentUiMetadata.seo_description,
          hero_description: data1.data.hero_description || currentUiMetadata.hero_description
        })
      };
      
      // Update form immediately so user doesn't lose data if step 2 fails
      onUpdate(currentItem);
      toast.success('İçerik başarıyla üretildi. Şimdi SSS üretiliyor...', { id: toastId });

      // 2. Generate FAQ
      toastId = toast.loading(`"${currentItem.name}" için SSS üretiliyor... (2/2)`);
      
      const newMeta = JSON.parse(currentItem.ui_metadata || '{}');
      const existingFaqs: FAQ[] = Array.isArray(newMeta.faqs) ? newMeta.faqs : [];
      
      const res2 = await fetch('/api/admin/ai-generate-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceTitle: currentItem.name, 
          serviceDescription: currentItem.description || '',
          existingFaqCount: existingFaqs.length,
          type: 'sector'
        }),
      });

      if (!res2.ok) throw new Error('SSS oluşturma API hatası.');

      const resData2 = await res2.json();
      if (!resData2.success || !resData2.data || !Array.isArray(resData2.data.faqs)) {
        throw new Error('Geçerli SSS bulunamadı.');
      }

      const newFaqs = [...existingFaqs, ...resData2.data.faqs];
      
      currentItem = {
        ...currentItem,
        ui_metadata: JSON.stringify({
          ...newMeta,
          faqs: newFaqs
        })
      };
      
      onUpdate(currentItem);
      toast.success(`İçerik ve ${resData2.data.faqs.length} adet SSS başarıyla eklendi!`, { id: toastId });

    } catch (err: any) {
      toast.error('İşlem yarıda kesildi: ' + (err.message || 'Hata oluştu.'), { id: toastId });
    } finally {
      setGeneratingAi(false);
    }
  };

  useEffect(() => {
    if (!item.slug || item.slug.length < 2) {
      setSlugStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setSlugStatus('checking');
      try {
        const res = await fetch(`/api/admin/check-slug?type=sector&slug=${item.slug}`);
        const data = await res.json();
        setSlugStatus(data.exists ? 'exists' : 'available');
      } catch {
        setSlugStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [item.slug]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-form-group">
        <label className="admin-label">Sektör Adı</label>
        <input
          type="text"
          className="admin-input"
          value={item.name}
          onChange={(e) => {
            const val = e.target.value;
            const slug = val.toLowerCase()
              .replace(/Ğ/g, 'g').replace(/ğ/g, 'g')
              .replace(/Ü/g, 'u').replace(/ü/g, 'u')
              .replace(/Ş/g, 's').replace(/ş/g, 's')
              .replace(/İ/g, 'i').replace(/ı/g, 'i')
              .replace(/Ö/g, 'o').replace(/ö/g, 'o')
              .replace(/Ç/g, 'c').replace(/ç/g, 'c')
              .replace(/ /g, '-').replace(/[^\w-]/g, '');
            onUpdate({ ...item, name: val, slug });
          }}
          placeholder="Örn: Fabrikalar"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          Slug (URL)
          {slugStatus === 'exists' && (
            <span style={{ color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={14} /> Bu slug zaten kullanılıyor!
            </span>
          )}
          {slugStatus === 'available' && (
            <span style={{ color: '#10b981', fontSize: '12px' }}>Slug müsait ✓</span>
          )}
        </label>
        <input
          type="text"
          className={`admin-input ${slugStatus === 'exists' ? 'admin-input-error' : ''}`}
          value={item.slug}
          onChange={(e) => onUpdate({ ...item, slug: e.target.value })}
          placeholder="Örn: fabrikalar"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Açıklama (SEO/AEO Uyumlu)</label>
        <textarea
          className="admin-input"
          value={item.description || ''}
          onChange={(e) => onUpdate({ ...item, description: e.target.value })}
          placeholder="Sektöre özel açıklama metni..."
          rows={3}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label">İllüstrasyon / İkon</label>
        <AdminImagePicker
          value={item.image_path}
          onChange={(path) => onUpdate({ ...item, image_path: path })}
          label="İllüstrasyon Seç"
        />
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Sektörel Terimler (Dinamik Dil)
        </h4>
        <button 
          onClick={handleAiGenerate}
          disabled={generatingAi}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '11px', 
            fontWeight: 'bold', 
            backgroundColor: '#6366f1', 
            color: 'white', 
            border: 'none', 
            padding: '6px 12px', 
            borderRadius: '8px',
            cursor: 'pointer',
            opacity: generatingAi ? 0.5 : 1,
            marginTop: '12px'
          }}
        >
          <Sparkles size={14} /> {generatingAi ? 'Tümü Oluşturuluyor...' : 'AI İle Tümünü Doldur (İçerik + SSS)'}
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-label">Eylem (Action Verb)</label>
            <input
              type="text"
              className="admin-input"
              value={(() => {
                try { return JSON.parse(item.ui_metadata || '{}').action_verb || ''; } catch { return ''; }
              })()}
              onChange={(e) => {
                const current = JSON.parse(item.ui_metadata || '{}');
                onUpdate({ ...item, ui_metadata: JSON.stringify({ ...current, action_verb: e.target.value }) });
              }}
              placeholder="Örn: Uygulama, Kurulum"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Hizmet Soneki</label>
            <input
              type="text"
              className="admin-input"
              value={(() => {
                try { return JSON.parse(item.ui_metadata || '{}').service_suffix || ''; } catch { return ''; }
              })()}
              onChange={(e) => {
                const current = JSON.parse(item.ui_metadata || '{}');
                onUpdate({ ...item, ui_metadata: JSON.stringify({ ...current, service_suffix: e.target.value }) });
              }}
              placeholder="Örn: Çözümleri, Sistemleri"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Değer Önerisi</label>
            <input
              type="text"
              className="admin-input"
              value={(() => {
                try { return JSON.parse(item.ui_metadata || '{}').value_prop || ''; } catch { return ''; }
              })()}
              onChange={(e) => {
                const current = JSON.parse(item.ui_metadata || '{}');
                onUpdate({ ...item, ui_metadata: JSON.stringify({ ...current, value_prop: e.target.value }) });
              }}
              placeholder="Örn: Garantili, 7/24 Aktif"
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          SEO Ayarları
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-label">SEO Başlığı (Meta Title)</label>
            <input
              type="text"
              className="admin-input"
              value={(() => {
                try { return JSON.parse(item.ui_metadata || '{}').seo_title || ''; } catch { return ''; }
              })()}
              onChange={(e) => {
                const current = JSON.parse(item.ui_metadata || '{}');
                onUpdate({ ...item, ui_metadata: JSON.stringify({ ...current, seo_title: e.target.value }) });
              }}
              placeholder="Google aramalarında görünecek başlık..."
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">SEO Açıklaması (Meta Description)</label>
            <textarea
              className="admin-input"
              value={(() => {
                try { return JSON.parse(item.ui_metadata || '{}').seo_description || ''; } catch { return ''; }
              })()}
              onChange={(e) => {
                const current = JSON.parse(item.ui_metadata || '{}');
                onUpdate({ ...item, ui_metadata: JSON.stringify({ ...current, seo_description: e.target.value }) });
              }}
              placeholder="Google aramalarında görünecek 150-160 karakterlik açıklama..."
              rows={2}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sıkça Sorulan Sorular (SSS)
          </h4>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(() => {
            let faqs: FAQ[] = [];
            try { faqs = JSON.parse(item.ui_metadata || '{}').faqs || []; } catch {}
            
            if (!Array.isArray(faqs) || faqs.length === 0) {
              return (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db', color: '#6b7280', fontSize: '14px' }}>
                  Henüz bu sektör için SSS eklenmemiş. Yukarıdaki "AI İle Tümünü Doldur" butonunu kullanabilirsiniz.
                </div>
              );
            }

            return faqs.map((faq, index) => (
              <div key={index} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    const currentMeta = JSON.parse(item.ui_metadata || '{}');
                    const newFaqs = [...faqs];
                    newFaqs.splice(index, 1);
                    onUpdate({ ...item, ui_metadata: JSON.stringify({ ...currentMeta, faqs: newFaqs }) });
                  }}
                  style={{ position: 'absolute', top: '12px', right: '12px', color: '#ef4444', padding: '4px', borderRadius: '4px', background: '#fee2e2' }}
                  title="Soruyu Sil"
                >
                  <Trash2 size={14} />
                </button>
                <div className="admin-form-group" style={{ marginBottom: '12px', paddingRight: '30px' }}>
                  <label className="admin-label" style={{ fontSize: '12px' }}>Soru {index + 1}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={faq.question}
                    onChange={(e) => {
                      const currentMeta = JSON.parse(item.ui_metadata || '{}');
                      const newFaqs = [...faqs];
                      newFaqs[index] = { ...faq, question: e.target.value };
                      onUpdate({ ...item, ui_metadata: JSON.stringify({ ...currentMeta, faqs: newFaqs }) });
                    }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label" style={{ fontSize: '12px' }}>Cevap (HTML Kullanılabilir)</label>
                  <textarea
                    className="admin-input"
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => {
                      const currentMeta = JSON.parse(item.ui_metadata || '{}');
                      const newFaqs = [...faqs];
                      newFaqs[index] = { ...faq, answer: e.target.value };
                      onUpdate({ ...item, ui_metadata: JSON.stringify({ ...currentMeta, faqs: newFaqs }) });
                    }}
                  />
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Önerilen Hizmetler (Manuel veya AI Seçimi)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
          {servicesList.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Hizmetler yükleniyor...</span>
          ) : (
            servicesList.map(svc => {
              const isSelected = item.recommended_service_ids?.includes(svc.id);
              return (
                <label key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', backgroundColor: isSelected ? '#e0e7ff' : '#fff', border: `1px solid ${isSelected ? '#818cf8' : '#e2e8f0'}`, fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const current = item.recommended_service_ids || [];
                      let next;
                      if (e.target.checked) next = [...current, svc.id];
                      else next = current.filter(id => id !== svc.id);
                      onUpdate({ ...item, recommended_service_ids: next });
                    }}
                    style={{ margin: 0 }}
                  />
                  <span style={{ color: isSelected ? '#4338ca' : '#475569', fontWeight: isSelected ? 600 : 400 }}>{svc.title}</span>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="admin-form-group">
          <label className="admin-label">Sıralama</label>
          <input
            type="number"
            className="admin-input"
            value={item.sort_order}
            onChange={(e) => onUpdate({ ...item, sort_order: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="admin-form-group" style={{ alignSelf: 'center', marginTop: '15px' }}>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={item.active}
              onChange={(e) => onUpdate({ ...item, active: e.target.checked })}
            />
            <span className="admin-toggle-slider"></span>
            <span className="admin-toggle-label">Aktif</span>
          </label>
        </div>
      </div>
    </div>
  );
}
