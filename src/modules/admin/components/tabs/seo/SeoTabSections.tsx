'use client';

import { Globe } from 'lucide-react';
import AdminImagePicker from '@/modules/admin/components/AdminImagePicker';
import type { SeoData } from '@/core/types';

interface SeoTabSectionsProps {
  seo: Record<string, SeoData>;
  pages: { key: string; label: string }[];
  onUpdate: (data: Record<string, SeoData>) => void;
}

export default function SeoTabSections({ seo, pages, onUpdate }: SeoTabSectionsProps) {
  return (
    <div className="admin-seo-stack">
      <p className="admin-section-description">Sayfa bazlı SEO başlıklarını, açıklamalarını ve sosyal medya (OG) görsellerini yönetin.</p>

      {pages.map(({ key, label }) => {
        const data = seo[key] || { title: '', description: '', ogImage: '' };

        return (
          <section key={key} className="admin-seo-card">
            <div className="admin-seo-header">
              <div className="admin-seo-title">
                <Globe size={20} className="admin-seo-icon" />
                <h4 className="admin-seo-heading">{label}</h4>
              </div>
              <span className="admin-seo-id">ID: {key}</span>
            </div>

            <div className="admin-seo-grid">
              <div className="admin-seo-fields">
                <div className="admin-form-group">
                  <label className="admin-label">Tab Başlığı (Meta Title)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={data.title}
                    onChange={(event) => onUpdate({ ...seo, [key]: { ...data, title: event.target.value } })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama (Meta Description)</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={data.description}
                    onChange={(event) => onUpdate({ ...seo, [key]: { ...data, description: event.target.value } })}
                  />
                </div>
              </div>

              <div className="admin-seo-fields admin-seo-fields-compact">
                <label className="admin-label">Paylaşım Görseli (OpenGraph Image)</label>
                <AdminImagePicker
                  value={data.ogImage || ''}
                  onChange={(path) => onUpdate({ ...seo, [key]: { ...data, ogImage: path } })}
                  label="OG Görseli Yükle"
                />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Veya URL yapıştırın"
                  value={data.ogImage || ''}
                  onChange={(event) => onUpdate({ ...seo, [key]: { ...data, ogImage: event.target.value } })}
                />
              </div>
            </div>

            <div className="admin-seo-preview-grid">
              <div className="admin-seo-preview-card">
                <span className="admin-seo-preview-label">Google Önizleme</span>
                <div className="admin-seo-snippet-url">https://example.com/{key === 'home' ? '' : key}</div>
                <div className="admin-seo-snippet-title">{data.title || 'Başlık burada görünecek'}</div>
                <div className="admin-seo-snippet-description">{data.description || 'Açıklama burada görünecek. Meta description alanını doldurdukça önizleme canlanır.'}</div>
              </div>

              <div className="admin-seo-preview-card">
                <span className="admin-seo-preview-label">Open Graph Önizleme</span>
                <div className="admin-seo-og-card">
                  <div className="admin-seo-og-image">
                    {data.ogImage ? (
                       
                      <img src={data.ogImage} alt={data.title || label} className="admin-seo-og-image-tag" />
                    ) : (
                      <div className="admin-seo-og-image-placeholder">OG Görseli</div>
                    )}
                  </div>
                  <div className="admin-seo-og-content">
                    <div className="admin-seo-og-domain">example.com</div>
                    <div className="admin-seo-og-title">{data.title || 'Paylaşım başlığı burada görünecek'}</div>
                    <div className="admin-seo-og-description">{data.description || 'Paylaşım açıklaması burada görünecek.'}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

