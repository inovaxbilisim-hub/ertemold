'use client';

import type { SeoData, SiteSettings } from '@/core/types';
import SeoTabSections from './seo/SeoTabSections';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import AdminImagePicker from '@/modules/admin/components/AdminImagePicker';

interface SeoTabProps {
  seo: Record<string, SeoData> | null;
  settings: SiteSettings;
  pages: any[];
  saving: boolean;
  onUpdate: (data: Record<string, SeoData>) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onSave: () => void;
  onFileUpload: (e: any, callback: (path: string) => void) => void;
}

export default function SeoTab({ seo, settings, pages, saving, onUpdate, onUpdateSettings, onSave }: SeoTabProps) {
  const [generating, setGenerating] = useState(false);

  if (!seo) {
    return null;
  }

  const seoPages = [
    { key: 'home', label: 'Ana Sayfa' },
    { key: 'hizmetler', label: 'Tüm Hizmetler Sayfası' },
    { key: 'hakkimizda', label: 'Hakkımızda Sayfası' },
    { key: 'iletisim', label: 'İletişim Sayfası' },
    { key: 'referanslar', label: 'Referanslar Sayfası' },
    { key: 'hizmetlerimiz', label: 'Kurumsal Çözümler Sayfası' },
    { key: 'lokasyonlar', label: 'Operasyon Merkezleri Sayfası' },
    { key: 'blog', label: 'Blog Sayfası' },
    { key: 'subelerimiz', label: 'Şubelerimiz Sayfası' },
    // Dinamik sayfaları ekle
    ...pages.map(p => ({
      key: p.slug === '/' ? 'home' : p.slug.replace(/^\//, ''),
      label: `${p.title} (Özel Sayfa)`
    })).filter(p => p.key !== 'home') // Ana sayfa zaten var
  ];

  // duplicate kontrolü yap
  const uniqueSeoPages = Array.from(new Map(seoPages.map(item => [item.key, item])).values());

  const getDefaultSeoPrompt = () => {
    const company = settings.companyName || 'Firmamız';
    return `Sen "${company}" firması için çalışan uzman bir SEO danışmanısın. 
Görevin: Sitemizdeki tüm ana sayfalar için (Ana Sayfa, Hakkımızda, İletişim vb.) arama hacmi yüksek, profesyonel ve kurumsal SEO başlıkları ve açıklamaları oluşturmak. 
Lütfen her sayfanın amacına uygun, güven veren ve tıklama oranını artıracak metinler hazırla.`;
  };

  const handleBulkAiGenerate = async () => {
    const activePrompt = settings.ai_prompt_seo_master || getDefaultSeoPrompt();
    
    setGenerating(true);
    const toastId = toast.loading('Yapay zeka tüm sayfalar için SEO metinleri üretiyor...');

    try {
      const response = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'seo_bulk',
          pages: uniqueSeoPages,
          title: 'SEO Bulk',
          prompt: activePrompt
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'AI hatası');

      const updatedSeo = { ...seo };
      Object.entries(result.data).forEach(([key, data]: [string, any]) => {
        // Eğer bu sayfa için SEO kaydı yoksa yeni oluştur, varsa güncelle
        updatedSeo[key] = {
          title: data.title || (updatedSeo[key]?.title || ''),
          description: data.description || (updatedSeo[key]?.description || ''),
          ogImage: updatedSeo[key]?.ogImage || '',
        };
      });

      onUpdate(updatedSeo);
      toast.success('Tüm SEO metinleri başarıyla üretildi. Kaydetmeyi unutmayın!', { id: toastId });
    } catch (error: unknown) {
      toast.error(`Hata: ${(error instanceof Error ? error.message : String(error))}`, { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="admin-seo-tab-container">
      <div className="admin-card">
        <div className="admin-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>SEO Master Asistanı</h3>
          </div>
          <button onClick={onSave} className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 32 }}>
            <div className="admin-form-group">
              <label className="admin-label">Master SEO Prompt (Yapay Zeka Talimatı)</label>
              <textarea
                className="admin-textarea"
                rows={5}
                placeholder="SEO talimatı girin..."
                value={settings.ai_prompt_seo_master || getDefaultSeoPrompt()}
                onChange={(e) => onUpdateSettings({ ...settings, ai_prompt_seo_master: e.target.value })}
              />
              <p className="admin-settings-hint" style={{ marginTop: 8 }}>
                {settings.ai_prompt_seo_master ? 'Özel talimatınız kullanılıyor.' : 'Varsayılan şablon gösteriliyor (üzerine yazıp değiştirebilirsiniz).'}
              </p>
              
              <button 
                onClick={handleBulkAiGenerate} 
                disabled={generating || saving}
                className="admin-btn admin-btn-primary"
                style={{ marginTop: 12, width: '100%' }}
              >
                {generating ? 'Üretiliyor...' : (
                  <>
                    <Sparkles size={16} />
                    Tüm Sayfaları AI ile Doldur
                  </>
                )}
              </button>
            </div>

            <div className="admin-form-group">
              <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ImageIcon size={16} />
                Global OpenGraph Görseli (Tüm Sayfalar İçin)
              </label>
              <AdminImagePicker
                value={settings.globalOgImage || ''}
                onChange={(path) => onUpdateSettings({ ...settings, globalOgImage: path })}
                label="Global OG Görseli Seç"
              />
              <p className="admin-settings-hint" style={{ marginTop: 8 }}>Özel bir paylaşım görseli seçilmemiş tüm sayfalarda bu görsel kullanılır.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Sayfa Bazlı SEO Yönetimi</h3>
          <button onClick={onSave} className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'SEO Değişikliklerini Kaydet'}
          </button>
        </div>

        <SeoTabSections 
          seo={seo} 
          pages={uniqueSeoPages}
          onUpdate={onUpdate} 
        />
      </div>
    </div>
  );
}
