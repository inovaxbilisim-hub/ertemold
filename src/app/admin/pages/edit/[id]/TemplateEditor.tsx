'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, LayoutTemplate, Plus, Sparkles, Loader2, Trash2, Globe, Settings } from 'lucide-react';
import { toast } from 'sonner';
import AdminImagePicker from '@/modules/admin/components/AdminImagePicker';
import MediaLibraryModal from '@/modules/admin/components/modals/MediaLibraryModal';
import BlockEditor from '@/modules/admin/components/BlockEditor';
import { Page, HeroData } from '@/core/types';
import '../../../admin.css';

export default function TemplateEditor({ 
  page: initialPage, 
  initialHero,
  allPages = []
}: { 
  page: Page, 
  initialHero: HeroData | null,
  allPages?: any[]
}) {
  const router = useRouter();
  
  const [page, setPage] = useState<Page>(() => {
    const contentData = typeof initialPage.content_data === 'string' 
      ? JSON.parse(initialPage.content_data) 
      : (initialPage.content_data || {});
    
    const initialBlocks = Array.isArray(contentData.blocks)
      ? [...contentData.blocks]
      : [];

    const normalizedContentData = {
      ...contentData,
      blocks: (initialPage.template_name === 'home' && initialBlocks.length === 0)
        ? [
            { id: 'initial_hero', type: 'component_ref', data: { component: 'Hero' } },
            { id: 'initial_services', type: 'component_ref', data: { component: 'Services' } },
            { id: 'initial_stats', type: 'component_ref', data: { component: 'Stats' } },
            { id: 'initial_refs', type: 'component_ref', data: { component: 'References' } }
          ]
        : initialBlocks
    };

    return {
      ...initialPage,
      content_data: normalizedContentData
    };
  });
  const [hero, setHero] = useState(initialHero || null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [modalOpen, setModalOpen] = useState(false);

  const handleUpdate = (field: keyof Page, value: any) => {
    setPage(prev => ({ ...prev, [field]: value }));
  };

  const handleContentUpdate = (field: string, value: any) => {
    setPage(prev => ({
      ...prev,
      content_data: { ...prev.content_data, [field]: value }
    }));
  };

  const handleHeroUpdate = (field: string, value: any) => {
    if (!hero) return;
    if (['badge', 'title', 'description', 'ctaText', 'ctaLink', 'ctaSecondaryText', 'ctaSecondaryLink'].includes(field)) {
      setHero((prev: any) => ({
        ...prev,
        left: { ...prev.left, [field]: value }
      }));
    } else {
      setHero((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save Page Data
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });

      // 2. Save Hero Data if it's the home page
      if (page.template_name === 'home' && hero) {
        await fetch('/api/admin/hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hero),
        });
      }

      if (res.ok) {
        toast.success('Sayfa başarıyla kaydedildi.');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error('Hata: ' + (err.error || 'Kaydedilemedi'));
      }
    } catch {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!page.title && page.template_name !== 'about') {
      toast.error('Lütfen önce bir başlık girin.');
      return;
    }

    setGenerating(true);
    try {
      const typeMap: Record<string, string> = {
        'about': 'about',
        'contact': 'contact',
        'references': 'references',
        'service': 'service',
        'default': 'service',
        'home': 'home'
      };

      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: page.title || (page.template_name === 'about' ? 'Hakkımızda' : page.title), 
          type: typeMap[page.template_name] || 'service' 
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        // Update hero state if it's home page
        if (page.template_name === 'home' && result.data.hero) {
          setHero(prev => {
            if (!prev) return null;
            return {
              ...prev,
              left: {
                ...prev.left,
                ...result.data.hero
              }
            };
          });
        }

        setPage(prev => ({
          ...prev,
          content_data: {
            ...prev.content_data,
            ...result.data
          },
          meta_title: result.data.meta_title || result.data.seo_title || prev.meta_title,
          meta_description: result.data.meta_description || result.data.seo_description || prev.meta_description
        }));
        toast.success('İçerik başarıyla üretildi.');
      } else {
        toast.error('AI hatası: ' + (result.error || 'İçerik üretilemedi'));
      }
    } catch {
      toast.error('AI servisine bağlanılamadı.');
    } finally {
      setGenerating(false);
    }
  };

  const renderAiButton = (label = 'AI ile Sayfayı Doldur') => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
      <button 
        onClick={handleAiGenerate} 
        disabled={generating}
        className="admin-btn-ai"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}
      >
        {generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
        {generating ? 'İçerik Üretiliyor...' : label}
      </button>
    </div>
  );

  const renderBlocks = () => (
    <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginTop: '32px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '10px', textTransform: 'uppercase' }}>Sayfa Akışı ve Ek Bölümler</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Aşağıdaki blok editörünü kullanarak sayfaya yeni bölümler ekleyebilirsiniz.</p>
      <BlockEditor 
        blocks={(page.content_data.blocks as any[]) || []} 
        onChange={(blocks) => handleContentUpdate('blocks', blocks)} 
        availablePages={allPages}
      />
    </div>
  );

  const renderTemplateFields = () => {
    switch (page.template_name) {
      case 'default':
      case 'service':
        return (
          <>
            {renderAiButton()}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="admin-form-group">
                <label className="admin-label">Üst Etiket (Badge)</label>
                <input type="text" className="admin-input" value={page.content_data.badge || ''} onChange={e => handleContentUpdate('badge', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Ana Başlık (Title)</label>
                <input type="text" className="admin-input" value={page.content_data.title || ''} onChange={e => handleContentUpdate('title', e.target.value)} />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Alt Başlık (Subtitle)</label>
              <textarea className="admin-textarea" rows={2} value={page.content_data.subtitle || ''} onChange={e => handleContentUpdate('subtitle', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Sayfa İçeriği / Özet (Body)</label>
              <textarea className="admin-textarea" rows={6} value={page.content_data.body || ''} onChange={e => handleContentUpdate('body', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Kapak Görseli</label>
              <AdminImagePicker value={page.content_data.image || ''} onChange={(path) => handleContentUpdate('image', path)} />
            </div>
            {renderBlocks()}
          </>
        );

      case 'about':
        return (
          <div className="space-y-8">
            {renderAiButton('AI ile Tüm Hakkımızda İçeriğini Yaz')}
            {/* 1. GİRİŞ / HERO */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '20px', textTransform: 'uppercase' }}>1. Giriş / Hero Bölümü</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-form-group">
                  <label className="admin-label">Üst Etiket (Badge)</label>
                  <input type="text" className="admin-input" value={page.content_data.badge || ''} onChange={e => handleContentUpdate('badge', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Ana Başlık</label>
                  <input type="text" className="admin-input" value={page.content_data.title || ''} onChange={e => handleContentUpdate('title', e.target.value)} />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Giriş Metni (Kısa)</label>
                <textarea className="admin-textarea" rows={2} value={page.content_data.descriptionTop || ''} onChange={e => handleContentUpdate('descriptionTop', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Hikaye Başlığı</label>
                <input type="text" className="admin-input" value={page.content_data.storyTitle || ''} onChange={e => handleContentUpdate('storyTitle', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Hikaye Metni (Detaylı)</label>
                <textarea className="admin-textarea" rows={4} value={page.content_data.descriptionBottom || ''} onChange={e => handleContentUpdate('descriptionBottom', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-form-group">
                  <label className="admin-label">Tecrübe Etiketi (örn: Deneyimimiz)</label>
                  <input type="text" className="admin-input" value={page.content_data.experienceLabel || ''} onChange={e => handleContentUpdate('experienceLabel', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Tecrübe Yılı (örn: 20+ YIL)</label>
                  <input type="text" className="admin-input" value={page.content_data.experienceYears || ''} onChange={e => handleContentUpdate('experienceYears', e.target.value)} />
                </div>
              </div>
            </div>

            {/* 2. İSTATİSTİKLER (MILESTONES) */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '20px', textTransform: 'uppercase' }}>2. Başarı Göstergeleri (Milestones)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map(idx => (
                  <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <input 
                      placeholder="Değer (örn: 20+)" 
                      className="admin-input" 
                      style={{ marginBottom: '8px' }}
                      value={page.content_data.milestones?.[idx]?.val || ''} 
                      onChange={e => {
                        const newMilestones = [...(page.content_data.milestones || [{val:'',label:''},{val:'',label:''},{val:'',label:''},{val:'',label:''}])];
                        newMilestones[idx] = { ...newMilestones[idx], val: e.target.value };
                        handleContentUpdate('milestones', newMilestones);
                      }} 
                    />
                    <input 
                      placeholder="Etiket (örn: Yıl Deneyim)" 
                      className="admin-input" 
                      value={page.content_data.milestones?.[idx]?.label || ''} 
                      onChange={e => {
                        const newMilestones = [...(page.content_data.milestones || [{val:'',label:''},{val:'',label:''},{val:'',label:''},{val:'',label:''}])];
                        newMilestones[idx] = { ...newMilestones[idx], label: e.target.value };
                        handleContentUpdate('milestones', newMilestones);
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MİSYON & VİZYON */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '20px', textTransform: 'uppercase' }}>3. Misyon & Vizyon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="admin-label" style={{ color: 'var(--accent-blue)' }}>Misyon</label>
                  <input placeholder="Başlık" className="admin-input" value={page.content_data.missionTitle || ''} onChange={e => handleContentUpdate('missionTitle', e.target.value)} />
                  <textarea placeholder="Açıklama" className="admin-textarea" rows={3} value={page.content_data.missionDesc || ''} onChange={e => handleContentUpdate('missionDesc', e.target.value)} />
                </div>
                <div className="space-y-4">
                  <label className="admin-label" style={{ color: 'var(--accent-teal)' }}>Vizyon</label>
                  <input placeholder="Başlık" className="admin-input" value={page.content_data.visionTitle || ''} onChange={e => handleContentUpdate('visionTitle', e.target.value)} />
                  <textarea placeholder="Açıklama" className="admin-textarea" rows={3} value={page.content_data.visionDesc || ''} onChange={e => handleContentUpdate('visionDesc', e.target.value)} />
                </div>
              </div>
            </div>

            {/* 4. EK BÖLÜM BAŞLIKLARI (Üstüne Yazma) */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-purple)', marginBottom: '20px', textTransform: 'uppercase' }}>4. Bölüm Başlıkları (Override)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="admin-label">Hizmetlerimiz Alanı</label>
                  <input placeholder="Hizmetlerimiz Başlığı" className="admin-input" value={page.content_data.servicesTitle || ''} onChange={e => handleContentUpdate('servicesTitle', e.target.value)} />
                  <textarea placeholder="Hizmetlerimiz Alt Yazısı" className="admin-textarea" rows={2} value={page.content_data.servicesSubtitle || ''} onChange={e => handleContentUpdate('servicesSubtitle', e.target.value)} />
                </div>
                <div className="space-y-4">
                  <label className="admin-label">Değerlerimiz Alanı</label>
                  <input placeholder="Değerlerimiz Başlığı" className="admin-input" value={page.content_data.valuesTitle || ''} onChange={e => handleContentUpdate('valuesTitle', e.target.value)} />
                </div>
              </div>
            </div>

            {/* 5. GÖRSELLER */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '20px', textTransform: 'uppercase' }}>5. Sayfa Görselleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {[0, 1, 2, 3].map(idx => (
                    <div key={idx} className="admin-form-group">
                      <label className="admin-label">Görsel {idx + 1}</label>
                      <AdminImagePicker 
                        value={page.content_data.images?.[idx] || ''} 
                        onChange={(path) => {
                          const newImages = [...(page.content_data.images || ['', '', '', ''])];
                          newImages[idx] = path;
                          handleContentUpdate('images', newImages);
                        }} 
                      />
                    </div>
                 ))}
              </div>
            </div>

            {/* 6. ALT ÇAĞRI (CTA) */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '20px', textTransform: 'uppercase' }}>6. Alt İletişim / CTA Bölümü</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-form-group">
                  <label className="admin-label">Alt Başlık</label>
                  <input type="text" className="admin-input" value={page.content_data.ctaTitle || ''} onChange={e => handleContentUpdate('ctaTitle', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Alt Buton Metni</label>
                  <input type="text" className="admin-input" value={page.content_data.ctaButtonText || ''} onChange={e => handleContentUpdate('ctaButtonText', e.target.value)} />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Alt Açıklama</label>
                <textarea className="admin-textarea" rows={2} value={page.content_data.ctaDesc || ''} onChange={e => handleContentUpdate('ctaDesc', e.target.value)} />
              </div>
            </div>

            {/* 7. DEĞERLER LİSTESİ (DİNAMİK) */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>7. Değerler Listesi (İkonlu)</h3>
                <button 
                  onClick={() => handleContentUpdate('values', [...(page.content_data.values || []), { iconName: 'Shield', title: 'Yeni Değer', desc: '' }])}
                  className="admin-tab-btn" style={{ padding: '4px 12px', fontSize: '12px', width: 'auto' }}
                >
                  <Plus size={14} /> Değer Ekle
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(page.content_data.values || []).map((val: any, vIdx: number) => (
                  <div key={vIdx} style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                    <button 
                      onClick={() => {
                        const newVals = page.content_data.values.filter((_: any, i: number) => i !== vIdx);
                        handleContentUpdate('values', newVals);
                      }}
                      style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="admin-form-group">
                      <label className="admin-label">İkon (Lucide Name)</label>
                      <input className="admin-input" value={val.iconName || ''} onChange={e => {
                        const newVals = [...page.content_data.values];
                        newVals[vIdx].iconName = e.target.value;
                        handleContentUpdate('values', newVals);
                      }} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Başlık</label>
                      <input className="admin-input" value={val.title || ''} onChange={e => {
                        const newVals = [...page.content_data.values];
                        newVals[vIdx].title = e.target.value;
                        handleContentUpdate('values', newVals);
                      }} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Açıklama</label>
                      <textarea className="admin-textarea" rows={2} value={val.desc || ''} onChange={e => {
                        const newVals = [...page.content_data.values];
                        newVals[vIdx].desc = e.target.value;
                        handleContentUpdate('values', newVals);
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderBlocks()}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-8">
            {renderAiButton('AI ile İletişim İçeriği Yaz')}
            
            {/* Hero / Giriş */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '20px', textTransform: 'uppercase' }}>1. İletişim Başlıkları</h3>
              <div className="admin-form-group">
                <label className="admin-label">Üst Rozet</label>
                <input type="text" className="admin-input" value={page.content_data.badge || ''} onChange={e => handleContentUpdate('badge', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Ana Başlık</label>
                <input type="text" className="admin-input" value={page.content_data.title || ''} onChange={e => handleContentUpdate('title', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Alt Başlık</label>
                <textarea className="admin-textarea" rows={2} value={page.content_data.subtitle || ''} onChange={e => handleContentUpdate('subtitle', e.target.value)} />
              </div>
            </div>

            {/* Ayarlar ve Override */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '20px', textTransform: 'uppercase' }}>2. Form ve Şube Ayarları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-form-group">
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={page.content_data.showForm !== false} onChange={e => handleContentUpdate('showForm', e.target.checked)} />
                    İletişim Formunu Göster
                  </label>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Özel Telefon (Boşsa genel ayar kullanılır)</label>
                  <input type="text" className="admin-input" value={page.content_data.overridePhone || ''} onChange={e => handleContentUpdate('overridePhone', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-form-group">
                  <label className="admin-label">Şubeler Bölümü Başlığı</label>
                  <input type="text" className="admin-input" placeholder="Şubelerimiz" value={page.content_data.branchesTitle || ''} onChange={e => handleContentUpdate('branchesTitle', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Form Bölümü Başlığı</label>
                  <input type="text" className="admin-input" placeholder="Bize Ulaşın" value={page.content_data.formTitle || ''} onChange={e => handleContentUpdate('formTitle', e.target.value)} />
                </div>
              </div>
            </div>

            {renderBlocks()}
          </div>
        );

      case 'references':
        return (
          <div className="space-y-8">
            {renderAiButton('AI ile Referanslar İçeriği Yaz')}
            
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '20px', textTransform: 'uppercase' }}>1. Referans Başlıkları</h3>
              <div className="admin-form-group">
                <label className="admin-label">Üst Rozet</label>
                <input type="text" className="admin-input" value={page.content_data.badge || ''} onChange={e => handleContentUpdate('badge', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Ana Başlık</label>
                <input type="text" className="admin-input" value={page.content_data.title || ''} onChange={e => handleContentUpdate('title', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Alt Başlık</label>
                <textarea className="admin-textarea" rows={2} value={page.content_data.subtitle || ''} onChange={e => handleContentUpdate('subtitle', e.target.value)} />
              </div>
            </div>

            {/* Referanslar Sayfasındaki Değerler */}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase' }}>2. Sayfa Değerleri (Opsiyonel)</h3>
                <button 
                  onClick={() => handleContentUpdate('values', [...(page.content_data.values || []), { iconName: 'Shield', title: 'Yeni Değer', desc: '' }])}
                  className="admin-tab-btn" style={{ padding: '4px 12px', fontSize: '12px', width: 'auto' }}
                >
                  <Plus size={14} /> Değer Ekle
                </button>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Değerler Bölümü Başlığı</label>
                <input className="admin-input" value={page.content_data.valuesTitle || ''} onChange={e => handleContentUpdate('valuesTitle', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(page.content_data.values || []).map((val: any, vIdx: number) => (
                  <div key={vIdx} style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                    <button 
                      onClick={() => {
                        const newVals = page.content_data.values.filter((_: any, i: number) => i !== vIdx);
                        handleContentUpdate('values', newVals);
                      }}
                      style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="admin-form-group">
                      <label className="admin-label">İkon (Lucide Name)</label>
                      <input className="admin-input" value={val.iconName || ''} onChange={e => {
                        const newVals = [...page.content_data.values];
                        newVals[vIdx].iconName = e.target.value;
                        handleContentUpdate('values', newVals);
                      }} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Başlık</label>
                      <input className="admin-input" value={val.title || ''} onChange={e => {
                        const newVals = [...page.content_data.values];
                        newVals[vIdx].title = e.target.value;
                        handleContentUpdate('values', newVals);
                      }} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Açıklama</label>
                      <textarea className="admin-textarea" rows={2} value={val.desc || ''} onChange={e => {
                        const newVals = [...page.content_data.values];
                        newVals[vIdx].desc = e.target.value;
                        handleContentUpdate('values', newVals);
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderBlocks()}
          </div>
        );

      case 'home':
        return (
          <div className="space-y-8">
            {renderAiButton('AI ile Ana Sayfa Tanıtımını Yaz')}
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--accent-blue-20)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '20px', textTransform: 'uppercase' }}>Ana Sayfa Tanıtım (Hero) Bölümü</h3>
              {hero && (
                <>
                  <div className="admin-form-group">
                    <label className="admin-label">Üst Rozet (Badge)</label>
                    <input type="text" className="admin-input" value={hero.left.badge || ''} onChange={e => handleHeroUpdate('badge', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Ana Başlık</label>
                    <input type="text" className="admin-input" value={hero.left.title || ''} onChange={e => handleHeroUpdate('title', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Kısa Açıklama</label>
                    <textarea className="admin-textarea" rows={3} value={hero.left.description || ''} onChange={e => handleHeroUpdate('description', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="admin-form-group">
                      <label className="admin-label">Birincil Buton Metni</label>
                      <input type="text" className="admin-input" value={hero.left.ctaText || ''} onChange={e => handleHeroUpdate('ctaText', e.target.value)} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Birincil Buton Link</label>
                      <input type="text" className="admin-input" value={hero.left.ctaLink || ''} onChange={e => handleHeroUpdate('ctaLink', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '20px' }}>
                    <div className="admin-form-group">
                      <label className="admin-label">Galeri Düzeni</label>
                      <select className="admin-input" value={hero.galleryLayout || 'masonry'} onChange={e => handleHeroUpdate('galleryLayout', e.target.value)}>
                        <option value="masonry">Masonry (Değişken Boyutlu)</option>
                        <option value="grid">Grid (Standart Izgara)</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Görüntülenecek Görsel Sayısı</label>
                      <input type="number" className="admin-input" value={hero.galleryCount || 4} onChange={e => handleHeroUpdate('galleryCount', parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Hero Galeri (Görseller)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '10px' }}>
                      {(hero.gallery || []).map((img: any, i: number) => (
                        <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-subtle)' }}>
                           <img src={img.path || img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button onClick={() => handleHeroUpdate('gallery', hero.gallery.filter((_: any, idx: number) => idx !== i))} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button onClick={() => setModalOpen(true)} style={{ aspectRatio: '1', borderRadius: '12px', border: '2px dashed var(--border-strong)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={24} /></button>
                    </div>
                  </div>
                  <MediaLibraryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSelect={(url) => { 
                    const newGallery = [...(hero.gallery || []), { path: url, type: 'image', size: 'small', alt: '' }];
                    handleHeroUpdate('gallery', newGallery);
                    setModalOpen(false); 
                  }} />
                </>
              )}
            </div>

            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '10px', textTransform: 'uppercase' }}>Sayfa Akışı ve Bileşenler</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Aşağıdaki blok editörünü kullanarak ana sayfa bölümlerini sıralayabilirsiniz.</p>
              <BlockEditor 
                blocks={(page.content_data.blocks as any[]) || []} 
                onChange={(blocks) => handleContentUpdate('blocks', blocks)} 
                availablePages={allPages}
              />
            </div>
          </div>
        );

      default:
        return <p>Geçersiz veya bilinmeyen şablon.</p>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5, 13, 26, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => router.push('/admin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowLeft size={18} /> Geri Dön</button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Sayfa Düzenle: {page.title}</h1>
            <span style={{ fontSize: '13px', color: 'var(--accent-teal)' }}>{page.slug}</span>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn-save" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Save size={18} /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</button>
      </header>

      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' }}>
        <aside>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <button onClick={() => setActiveTab('content')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'content' ? 'var(--accent-blue-10)' : 'transparent', color: activeTab === 'content' ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><LayoutTemplate size={18} /> İçerik</button>
            <button onClick={() => setActiveTab('seo')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'seo' ? 'var(--accent-blue-10)' : 'transparent', color: activeTab === 'seo' ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Globe size={18} /> SEO</button>
            <button onClick={() => setActiveTab('settings')} style={{ width: '100%', textAlign: 'left', padding: '16px', border: 'none', background: activeTab === 'settings' ? 'var(--accent-blue-10)' : 'transparent', color: activeTab === 'settings' ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={18} /> Ayarlar</button>
          </div>
        </aside>

        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '32px' }}>
          {activeTab === 'content' && <div className="fade-in">{renderTemplateFields()}</div>}
          {activeTab === 'seo' && (
            <div className="fade-in">
              <div className="admin-form-group"><label className="admin-label">Meta Başlık</label><input className="admin-input" value={page.meta_title || ''} onChange={e => handleUpdate('meta_title', e.target.value)} /></div>
              <div className="admin-form-group"><label className="admin-label">Meta Açıklama</label><textarea className="admin-textarea" rows={3} value={page.meta_description || ''} onChange={e => handleUpdate('meta_description', e.target.value)} /></div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="fade-in">
              <div className="admin-form-group"><label className="admin-label">URL Yolu (Slug)</label><input className="admin-input" value={page.slug || ''} onChange={e => handleUpdate('slug', e.target.value)} /></div>
              <div className="admin-form-group">
                <label className="admin-label">Yayın Durumu</label>
                <select className="admin-input" value={page.is_published ? 1 : 0} onChange={e => handleUpdate('is_published', e.target.value === '1')}><option value={1}>Yayında</option><option value={0}>Taslak</option></select>
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
