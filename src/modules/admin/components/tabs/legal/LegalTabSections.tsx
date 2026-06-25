"use client";

import { useState } from 'react';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import type { LegalPage } from '@/core/types';

interface LegalTabSectionsProps {
  legal: Record<string, LegalPage>;
  onUpdate: (data: Record<string, LegalPage>) => void;
}

export default function LegalTabSections({ legal, onUpdate }: LegalTabSectionsProps) {
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);

  const handleAiGenerate = async (key: string, title: string) => {
    setGeneratingKey(key);
    try {
      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type: 'legal' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hata oluştu');

      if (data.success && data.data) {
        const page = legal[key];
        const next = { 
          ...legal, 
          [key]: { 
            ...page, 
            content: data.data.content || page.content,
            metaTitle: data.data.metaTitle || page.metaTitle,
            metaDescription: data.data.metaDescription || page.metaDescription
          } 
        };
        onUpdate(next);
      }
    } catch (err: unknown) {
      alert(`Yapay zeka hatası: ${(err instanceof Error ? err.message : String(err))}`);
    } finally {
      setGeneratingKey(null);
    }
  };

  return (
    <div className="admin-legal-stack">
      <p className="admin-section-description">KVKK, Kullanım Koşulları ve Gizlilik Politikası gibi yasal metinleri yönetin.</p>

      {Object.entries(legal).map(([key, page]) => (
        <section key={key} className="admin-legal-card">
          <div className="admin-legal-header">
            <div className="admin-legal-title">
              <FileText size={20} className="admin-legal-icon" />
              <h4 className="admin-legal-heading">{page.title}</h4>
            </div>
            <div className="flex items-center gap-4">
              <span className="admin-legal-slug">Slug: /yasal/{key}</span>
              <button
                onClick={() => handleAiGenerate(key, page.title)}
                disabled={generatingKey !== null}
                className="admin-btn admin-btn-sm admin-btn-dashed"
              >
                {generatingKey === key ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                AI ile Doldur
              </button>
            </div>
          </div>

          <div className="admin-settings-two-col">
            <div className="admin-form-group admin-form-group-compact">
              <label className="admin-label">Meta Başlık (SEO)</label>
              <input
                type="text"
                className="admin-input"
                value={page.metaTitle || ''}
                onChange={(event) => {
                  const next = { ...legal, [key]: { ...page, metaTitle: event.target.value } };
                  onUpdate(next);
                }}
              />
            </div>
            <div className="admin-form-group admin-form-group-compact">
              <label className="admin-label">Meta Açıklama (SEO)</label>
              <input
                type="text"
                className="admin-input"
                value={page.metaDescription || ''}
                onChange={(event) => {
                  const next = { ...legal, [key]: { ...page, metaDescription: event.target.value } };
                  onUpdate(next);
                }}
              />
            </div>
          </div>

          <div className="admin-form-group admin-form-group-compact">
            <label className="admin-label">Sayfa İçeriği (Markdown/HTML desteklenir)</label>
            <textarea
              className="admin-textarea"
              rows={12}
              value={page.content || ''}
              onChange={(event) => {
                const next = { ...legal, [key]: { ...page, content: event.target.value } };
                onUpdate(next);
              }}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
