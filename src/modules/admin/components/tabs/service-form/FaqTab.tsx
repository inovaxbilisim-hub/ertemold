'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Copy, Sparkles } from 'lucide-react';
import type { Service } from '@/core/types';
import type { ServiceFaqItem } from './types';
import { toast } from 'sonner';

interface FaqTabProps {
  item: Partial<Service>;
  isCategory: boolean;
  onUpdate: (item: Partial<Service>) => void;
}

export default function FaqTab({ item, isCategory, onUpdate }: FaqTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const getFaqs = (): ServiceFaqItem[] =>
    Array.isArray((item as any).serviceFaqs) ? (item as any).serviceFaqs : [];

  // Debug: Log whenever component renders
  useEffect(() => {
    console.log('[FAQ-TAB] Component rendered, serviceFaqs:', (item as any).serviceFaqs);
    console.log('[FAQ-TAB] Current FAQ count:', getFaqs().length);
  }, [item.serviceFaqs, forceUpdate]);

  const addFaq = () => {
    const faqs = getFaqs();
    onUpdate({
      ...item,
      serviceFaqs: [
        ...faqs,
        {
          id: `faq-${Date.now()}`,
          question: '',
          answer: '',
          active: true,
          sort_order: faqs.length + 1,
        },
      ],
    } as any);
  };

  const handleAiGenerate = async () => {
    if (!item.title) {
      toast.error('Lütfen önce hizmet başlığını girin.');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('[FAQ-TAB] Starting AI generation for:', item.title);
      
      const response = await fetch('/api/admin/ai-generate-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTitle: item.title,
          serviceDescription: item.description || '',
          existingFaqCount: getFaqs().length,
        }),
      });

      console.log('[FAQ-TAB] Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('[FAQ-TAB] Error response:', error);
        throw new Error(error.error || 'AI üretim hatası');
      }

      const responseData = await response.json();
      console.log('[FAQ-TAB] Response data:', responseData);
      
      // Extract faqs from response (handle both { data: { faqs } } and { faqs } formats)
      const generatedFaqs = responseData.data?.faqs || responseData.faqs || [];
      console.log('[FAQ-TAB] Generated FAQs count:', generatedFaqs.length);

      if (generatedFaqs.length === 0) {
        toast.error('AI SSS oluşturamadı. Lütfen tekrar deneyin.');
        return;
      }

      const currentFaqs = getFaqs();
      console.log('[FAQ-TAB] Current FAQs count:', currentFaqs.length);
      
      const newFaqs = generatedFaqs.map((faq: any, index: number) => ({
        id: `faq-${Date.now()}-${index}`,
        question: faq.question || '',
        answer: faq.answer || '',
        active: true,
        sort_order: currentFaqs.length + index + 1,
      }));

      console.log('[FAQ-TAB] New FAQs:', newFaqs);
      console.log('[FAQ-TAB] Updating with total:', currentFaqs.length + newFaqs.length);

      const updatedItem = {
        ...item,
        serviceFaqs: [...currentFaqs, ...newFaqs],
      };
      
      console.log('[FAQ-TAB] ===== UPDATE DEBUG =====');
      console.log('[FAQ-TAB] Current item:', item);
      console.log('[FAQ-TAB] Current serviceFaqs:', item.serviceFaqs);
      console.log('[FAQ-TAB] New FAQs to add:', newFaqs);
      console.log('[FAQ-TAB] Updated item serviceFaqs:', updatedItem.serviceFaqs);
      console.log('[FAQ-TAB] Calling onUpdate...');
      
      onUpdate(updatedItem as any);
      
      // Force re-render after a short delay to ensure state is updated
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
      }, 100);
      
      console.log('[FAQ-TAB] onUpdate called - checking if component will re-render');
      console.log('[FAQ-TAB] ===== UPDATE DEBUG END =====');
      toast.success(`${generatedFaqs.length} SSS başarıyla oluşturuldu! Değişiklikleri kaydetmek için "Kaydet" butonuna basın.`, {
        duration: 5000
      });
    } catch (error: any) {
      console.error('[FAQ-TAB] AI FAQ Generation Error:', error);
      toast.error(error.message || 'SSS oluşturulurken hata oluştu.');
    } finally {
      setIsGenerating(false);
      console.log('[FAQ-TAB] Generation process completed');
    }
  };

  const removeFaq = (index: number) => {
    if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
    const updated = getFaqs()
      .filter((_, i) => i !== index)
      .map((faq, idx) => ({ ...faq, sort_order: idx + 1 }));
    onUpdate({ ...item, serviceFaqs: updated } as any);
  };

  const duplicateFaq = (index: number) => {
    const faqs = getFaqs();
    const original = faqs[index];
    const duplicated = {
      ...original,
      id: `faq-${Date.now()}`,
      question: `${original.question} (Kopya)`,
      sort_order: faqs.length + 1,
    };
    onUpdate({ ...item, serviceFaqs: [...faqs, duplicated] } as any);
  };

  const moveFaq = (index: number, direction: 'up' | 'down') => {
    const faqs = [...getFaqs()];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === faqs.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [faqs[index], faqs[targetIndex]] = [faqs[targetIndex], faqs[index]];
    
    // Update sort orders
    const updated = faqs.map((faq, idx) => ({ ...faq, sort_order: idx + 1 }));
    onUpdate({ ...item, serviceFaqs: updated } as any);
  };

  const updateFaq = (index: number, field: string, value: string | boolean) => {
    const faqs = [...getFaqs()];
    faqs[index] = { ...faqs[index], [field]: value };
    onUpdate({ ...item, serviceFaqs: faqs } as any);
  };

  if (isCategory) {
    return (
      <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
        Kategori türünde hizmetlere özel SSS eklenemez.
      </div>
    );
  }

  const faqs = getFaqs();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Info Banner */}
      <div style={{ padding: '16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: '#1e40af' }}>
              Hizmete Özel SSS Sistemi
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
              Bu hizmete özel sorular ekleyin. Boş bırakılırsa genel SSS havuzundan otomatik olarak ilgili sorular gösterilir.
              <br />
              <strong>Placeholder kullanımı:</strong> <code>{'{'}service{'}'}</code>, <code>{'{'}city{'}'}</code>, <code>{'{'}location{'}'}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Header + Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label className="admin-label" style={{ marginBottom: '4px' }}>
            Hizmet Bazlı SSS ({faqs.length})
          </label>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Sıralamayı değiştirmek için yukarı/aşağı okları kullanın
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            onClick={handleAiGenerate} 
            disabled={isGenerating || !item.title}
            className="admin-btn admin-btn-sm"
            style={{
              background: isGenerating ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isGenerating || !item.title ? 'not-allowed' : 'pointer',
            }}
          >
            <Sparkles size={14} />
            {isGenerating ? 'Oluşturuluyor...' : 'AI ile Üret'}
          </button>
          <button type="button" onClick={addFaq} className="admin-btn admin-btn-sm">
            <Plus size={14} /> Yeni Soru Ekle
          </button>
        </div>
      </div>

      {/* Liste */}
      {faqs.length === 0 ? (
        <div style={{ padding: '32px', borderRadius: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1', textAlign: 'center' }}>
          <span style={{ fontSize: '48px', opacity: 0.3 }}>❓</span>
          <p style={{ margin: '12px 0 0', fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
            Henüz SSS eklenmemiş
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Genel SSS havuzundan otomatik filtreleme yapılacak
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, faqIndex) => (
            <div
              key={faq.id || faqIndex}
              style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                background: 'white', 
                border: faq.active ? '2px solid #e2e8f0' : '2px dashed #cbd5e1',
                opacity: faq.active ? 1 : 0.6,
                transition: 'all 0.2s'
              }}
            >
              {/* Header with Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Drag Handle */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      type="button"
                      onClick={() => moveFaq(faqIndex, 'up')}
                      disabled={faqIndex === 0}
                      style={{
                        background: faqIndex === 0 ? '#f1f5f9' : '#e2e8f0',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        cursor: faqIndex === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '10px',
                        color: faqIndex === 0 ? '#cbd5e1' : '#475569'
                      }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFaq(faqIndex, 'down')}
                      disabled={faqIndex === faqs.length - 1}
                      style={{
                        background: faqIndex === faqs.length - 1 ? '#f1f5f9' : '#e2e8f0',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        cursor: faqIndex === faqs.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '10px',
                        color: faqIndex === faqs.length - 1 ? '#cbd5e1' : '#475569'
                      }}
                    >
                      ▼
                    </button>
                  </div>

                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      SSS #{faqIndex + 1}
                    </span>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '12px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(faq.active)}
                        onChange={e => updateFaq(faqIndex, 'active', e.target.checked)}
                      />
                      Aktif
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => duplicateFaq(faqIndex)}
                    title="Kopyala"
                    style={{ 
                      background: 'rgba(59,130,246,0.1)', 
                      border: 'none', 
                      color: '#3b82f6', 
                      borderRadius: '8px', 
                      padding: '6px 10px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFaq(faqIndex)}
                    title="Sil"
                    style={{ 
                      background: 'rgba(239,68,68,0.1)', 
                      border: 'none', 
                      color: '#ef4444', 
                      borderRadius: '8px', 
                      padding: '6px 10px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Soru */}
              <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                <label className="admin-label">Soru</label>
                <input
                  type="text"
                  className="admin-input"
                  value={faq.question || ''}
                  onChange={e => updateFaq(faqIndex, 'question', e.target.value)}
                  placeholder="Örn: {service} hangi sektörlerde kullanılır?"
                />
              </div>

              {/* Cevap */}
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">
                  Cevap
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>
                    (HTML etiketleri desteklenir: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;br&gt;)
                  </span>
                </label>
                <textarea
                  className="admin-textarea"
                  value={faq.answer || ''}
                  onChange={e => updateFaq(faqIndex, 'answer', e.target.value)}
                  rows={6}
                  placeholder="HTML etiketleri ile formatlanmış cevap yazabilirsiniz. Örnek: <p>Bu bir paragraf.</p><strong>Kalın metin</strong><br/><ul><li>Liste öğesi 1</li><li>Liste öğesi 2</li></ul>"
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                />
                <div style={{ marginTop: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>Önizleme:</p>
                  <div 
                    style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155' }}
                    dangerouslySetInnerHTML={{ __html: faq.answer || '<p style="color: #94a3b8; font-style: italic;">Cevap yazıldığında önizleme burada görünecek...</p>' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
