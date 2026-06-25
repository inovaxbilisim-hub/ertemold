'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useAdminActions } from '@/app/admin/hooks/useAdminActions';
import ServicesTabSections from '@/modules/admin/components/tabs/services/ServicesTabSections';
import ItemEditorModal from '@/modules/admin/components/modals/ItemEditorModal';
import ServiceForm from '@/modules/admin/components/tabs/ServiceForm';
import CategoryForm from '@/modules/admin/components/tabs/CategoryForm';
import CategoryManagementModal from '@/modules/admin/components/modals/CategoryManagementModal';

export default function ServicesPage() {
  const { 
    services, 
    categories, 
    sectors,
    settings,
    fetchData,
    loading 
  } = useAdminData(['services', 'categories', 'sectors']);
  
  const { saving, setSaving, handleSave } = useAdminActions(fetchData);

  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'service' | 'category' | null>(null);
  const [showAiPromptEditor, setShowAiPromptEditor] = useState(false);
  const [aiPromptTab, setAiPromptTab] = useState<'service' | 'category'>('service');
  const [servicePromptDraft, setServicePromptDraft] = useState('');
  const [categoryPromptDraft, setCategoryPromptDraft] = useState('');
  const [servicePromptFields, setServicePromptFields] = useState<string[]>([
    'title',
    'description',
    'longDescription',
    'calculator_description',
    'seoTitle',
    'seoDescription'
  ]);

  const normalizeServiceFieldKey = (field: string) => {
    const map: Record<string, string> = {
      title: 'title',
      description: 'description',
      long_description: 'longDescription',
      longDescription: 'longDescription',
      calculator_description: 'calculator_description',
      calculatorDescription: 'calculator_description',
      seo_title: 'seoTitle',
      seoTitle: 'seoTitle',
      seo_description: 'seoDescription',
      seoDescription: 'seoDescription',
    };
    return map[field] || field;
  };
  const [categoryPromptFields, setCategoryPromptFields] = useState<string[]>([
    'description',
    'features'
  ]);

  const SERVICE_PROMPT_FIELDS = [
    { key: 'title', label: 'Hizmet Başlığı' },
    { key: 'description', label: 'Kısa Açıklama' },
    { key: 'longDescription', label: 'Uzun Açıklama' },
    { key: 'calculator_description', label: 'Hesaplayıcı Açıklaması' },
    { key: 'seoTitle', label: 'SEO Başlığı' },
    { key: 'seoDescription', label: 'SEO Açıklaması' },
  ];

  const CATEGORY_PROMPT_FIELDS = [
    { key: 'description', label: 'Açıklama' },
    { key: 'features', label: 'Hizmet Özellikleri' },
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Hizmetler Yönetimi</h1>
            <span className="admin-badge">Yükleniyor</span>
          </div>
        </div>
        <div className="admin-loading">
          <div style={{ width: 24, height: 24, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'admin-spin 0.8s linear infinite' }} />
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Hizmetler Yönetimi</h1>
          <span className="admin-badge">{services.length} hizmet</span>
        </div>
      </div>
      
      <ServicesTabSections
        services={services}
        categories={categories}
        onEdit={(service) => { setEditItem(service); setEditType('service'); }}
        onDelete={async (id) => {
          if (confirm('Silmek istediğinize emin misiniz?')) {
            const response = await fetch(`/api/admin/services?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (response.ok) { toast.success('Hizmet silindi.'); await fetchData(); }
          }
        }}
        onCreate={() => {
          setEditItem({
            id: '',
            slug: '',
            category_id: '',
            title: '',
            description: '',
            longDescription: '',
            imagePath: '',
            color: '',
            seoTitle: '',
            seoDescription: '',
            calculator_enabled: false,
            calculator_price_per_sqm: 0,
            calculator_description: '',
            calculator_button_text: 'Teklif Hesapla',
            calculator_disclaimer: '',
            active: true,
            sortOrder: services.length + 1,
            serviceFaqs: [],
            _isNew: true,
          });
          setEditType('service');
        }}
        onManageCategories={() => setEditType('category')}
        onOpenAIPrompts={() => {
          setServicePromptDraft(settings?.ai_prompt_service || '');
          setCategoryPromptDraft(settings?.ai_prompt_category || '');
          setServicePromptFields(settings?.ai_prompt_service_fields?.length
            ? settings.ai_prompt_service_fields.map(normalizeServiceFieldKey)
            : ['title','description','longDescription','calculator_description','seoTitle','seoDescription']
          );
          setCategoryPromptFields(settings?.ai_prompt_category_fields?.length ? settings.ai_prompt_category_fields : ['description','features']);
          setAiPromptTab('service');
          setShowAiPromptEditor(true);
        }}
      />

      {editType === 'service' && (
        <ItemEditorModal
          title={editItem?._isNew ? 'Yeni Hizmet' : 'Hizmet Düzenle'}
          isOpen={true}
          saving={saving}
          onSave={async () => {
            if (editItem?._isCategory) {
              try {
                const res = await fetch('/api/admin/service-categories', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editItem)
                });
                if (res.ok) {
                  toast.success('Kategori başarıyla güncellendi.');
                  setEditItem(null); setEditType(null);
                  await fetchData();
                } else {
                  throw new Error('Kategori kaydedilemedi');
                }
              } catch (err) {
                toast.error('Hata: ' + (err instanceof Error ? err.message : 'Kayıt başarısız'));
              }
            } else {
              const timeline = editItem?.timeline_stages || [];
              if (timeline.length > 0 && (timeline.length < 4 || timeline.length > 8)) {
                toast.error('Uygulama süreç aşamaları tanımlanacaksa en az 4, en fazla 8 aşama olmalıdır.');
                return;
              }
              setSaving(true);
              try {
                const res = await fetch('/api/admin/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editItem)
                });
                if (res.ok) {
                  toast.success('Hizmet başarıyla kaydedildi.');
                  setEditItem(null); setEditType(null);
                  await fetchData();
                } else {
                  throw new Error('Kayıt başarısız');
                }
              } catch (err) {
                toast.error('Hata: ' + (err instanceof Error ? err.message : 'Kayıt başarısız'));
              } finally {
                setSaving(false);
              }
            }
          }}
          onClose={() => { setEditItem(null); setEditType(null); }}
        >
          {editItem?._isCategory ? (
            <CategoryForm
              item={editItem}
              onUpdate={(updated) => setEditItem(updated)}
            />
          ) : (
            <ServiceForm
              item={editItem}
              categories={categories}
              sectors={sectors}
              onUpdate={(updated) => {
                console.log('[SERVICES-PAGE] onUpdate called with:', updated);
                console.log('[SERVICES-PAGE] serviceFaqs:', updated.serviceFaqs);
                // Create completely new object to ensure React detects change
                setEditItem(() => {
                  const newItem = { ...updated };
                  // Force new array reference for serviceFaqs
                  if (updated.serviceFaqs) {
                    newItem.serviceFaqs = [...updated.serviceFaqs];
                  }
                  console.log('[SERVICES-PAGE] Setting new editItem with serviceFaqs count:', newItem.serviceFaqs?.length || 0);
                  return newItem;
                });
              }}
              onFileUpload={() => {
                 console.log('File upload triggered');
              }}
            />
          )}
        </ItemEditorModal>
      )}

      {editType === 'category' && (
        <CategoryManagementModal
          isOpen={true}
          onClose={() => setEditType(null)}
          categories={categories}
          saving={saving}
          onEdit={(category) => {
            setEditItem({ 
              ...category, 
              _isCategory: true 
            });
            setEditType('service');
          }}
          onDelete={async (id) => {
            if (confirm('Kategoriyi silmek istediğinize emin misiniz?')) {
              const res = await fetch(`/api/admin/service-categories?id=${id}`, { method: 'DELETE' });
              if (res.ok) {
                toast.success('Kategori silindi');
                await fetchData();
              }
            }
          }}
          onCreate={() => {
            toast.info('Yeni kategori ekleme yakında eklenecek.');
          }}
        />
      )}

      {showAiPromptEditor && (
        <ItemEditorModal
          title="Hizmet ve Kategori AI Prompt Yönetimi"
          isOpen={true}
          saving={saving}
          onClose={() => setShowAiPromptEditor(false)}
          onSave={async () => {
            if (!settings) return;
            if (servicePromptFields.length === 0) {
              alert('Lütfen hizmet için en az bir hedef alan seçin.');
              return;
            }
            if (categoryPromptFields.length === 0) {
              alert('Lütfen kategori için en az bir hedef alan seçin.');
              return;
            }
            await handleSave(
              'settings',
              {
                ...settings,
                ai_prompt_service: servicePromptDraft,
                ai_prompt_service_fields: servicePromptFields,
                ai_prompt_category: categoryPromptDraft,
                ai_prompt_category_fields: categoryPromptFields,
              },
              async () => {
                setShowAiPromptEditor(false);
              }
            );
          }}
        >
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setAiPromptTab('service')}
              className={`admin-btn ${aiPromptTab === 'service' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            >
              Hizmet Prompt
            </button>
            <button
              type="button"
              onClick={() => setAiPromptTab('category')}
              className={`admin-btn ${aiPromptTab === 'category' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            >
              Kategori Prompt
            </button>
          </div>

          {aiPromptTab === 'service' ? (
            <>
              <div className="admin-form-group">
                <label className="admin-label">Hizmet İçerik Üretimi Prompt'u</label>
                <textarea
                  className="admin-textarea"
                  rows={6}
                  value={servicePromptDraft}
                  onChange={(e) => setServicePromptDraft(e.target.value)}
                  placeholder="Hizmetler sayfasındaki AI içerik üretimi için kullanılacak sistem promptunu buraya yazın."
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                />
              </div>

              <div className="admin-form-group" style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc' }}>
                <p className="admin-text-muted" style={{ marginBottom: 12 }}>Hizmet içerik üretimi aşağıdaki alanları hedefleyebilir:</p>
                {SERVICE_PROMPT_FIELDS.map((field) => {
                  const checked = servicePromptFields.includes(field.key);
                  return (
                    <label key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setServicePromptFields((prev) =>
                            prev.includes(field.key)
                              ? prev.filter((item) => item !== field.key)
                              : [...prev, field.key]
                          );
                        }}
                      />
                      <span>{field.label}</span>
                    </label>
                  );
                })}
                <p className="admin-text-muted" style={{ marginTop: 0 }}>
                  Üretilen içerik bu alanlara öncelik vererek daha hedefli sonuçlar oluşturacaktır.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="admin-form-group">
                <label className="admin-label">Kategori İçerik Üretimi Prompt'u</label>
                <textarea
                  className="admin-textarea"
                  rows={6}
                  value={categoryPromptDraft}
                  onChange={(e) => setCategoryPromptDraft(e.target.value)}
                  placeholder="Kategoriler sayfasındaki AI içerik üretimi için kullanılacak sistem promptunu buraya yazın."
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                />
                <p className="admin-text-muted">
                  Bu prompt, yalnızca hizmet kategori içerik üretimi için uygulanacaktır.
                </p>
              </div>

              <div className="admin-form-group" style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc' }}>
                <p className="admin-text-muted" style={{ marginBottom: 12 }}>Kategori içerik üretimi aşağıdaki alanları hedefleyebilir:</p>
                {CATEGORY_PROMPT_FIELDS.map((field) => {
                  const checked = categoryPromptFields.includes(field.key);
                  return (
                    <label key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setCategoryPromptFields((prev) =>
                            prev.includes(field.key)
                              ? prev.filter((item) => item !== field.key)
                              : [...prev, field.key]
                          );
                        }}
                      />
                      <span>{field.label}</span>
                    </label>
                  );
                })}
                <p className="admin-text-muted" style={{ marginTop: 0 }}>
                  Üretilen kategori içeriği bu alanlara öncelik vererek daha hedefli sonuçlar oluşturacaktır.
                </p>
              </div>
            </>
          )}
        </ItemEditorModal>
      )}
    </div>
  );
}
