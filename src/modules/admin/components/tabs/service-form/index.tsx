'use client';

/**
 * ServiceForm — Modüler Hizmet Formu Orkestratörü
 *
 * 974 satırlık monolitik form 6 bağımsız tab bileşenine bölündü:
 * - GeneralTab    : Başlık, slug, kategori, renk, ikon, görsel
 * - ContentTab    : Açıklamalar, özellikler + AI üretim
 * - SeoTab        : SEO meta, pSEO şablonları, canlı önizleme
 * - FaqTab        : Hizmete özel SSS yönetimi
 * - AdvancedTab   : Timeline, uyumlu sektörler, hesaplayıcı
 */

import { useState } from 'react';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import type { ServiceFormProps, ServiceFormTab } from './types';
import { resolveSectorSlug, readJsonResponse } from './utils';
import GeneralTab from './GeneralTab';
import ContentTab from './ContentTab';
import SeoTab from './SeoTab';
import FaqTab from './FaqTab';
import AdvancedTab from './AdvancedTab';

const TABS: Array<{ id: ServiceFormTab; label: string }> = [
  { id: 'general',  label: 'Genel' },
  { id: 'content',  label: 'İçerik' },
  { id: 'seo',      label: 'SEO' },
  { id: 'faq',      label: 'SSS' },
  { id: 'advanced', label: 'Gelişmiş' },
];

export default function ServiceForm({
  item,
  categories,
  sectors = [],
  settings: propSettings,
  onUpdate,
}: ServiceFormProps) {
  const { settings: contextSettings } = useSettings();
  const settings = propSettings || contextSettings;

  const [activeTab, setActiveTab] = useState<ServiceFormTab>('general');
  const [isGenerating, setIsGenerating] = useState(false);

  const isNew = !item.id || (item as any)._isNew;
  const isCategory = !!(item as any)._isCategory;

  // ─── AI İçerik Üretimi ────────────────────────────────────────────────────
  const handleAiGenerate = async () => {
    if (!item.title) {
      alert('Lütfen önce bir hizmet başlığı girin.');
      return;
    }
    setIsGenerating(true);

    try {
      const promptFields = settings?.ai_prompt_service_fields || [
        'title', 'description', 'long_description',
        'calculator_description', 'seo_title', 'seo_description',
      ];

      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          type: 'service',
          sectors: sectors.map((s: any) => s.slug),
          fields: promptFields,
        }),
      });

      const responseData = await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(responseData?.error || responseData?.message || `HTTP ${res.status}`);
      }

      if (responseData?.success && responseData?.data) {
        const ai = responseData.data;

        // AI'dan gelen sektör slug'larını canonical listesiyle eşleştir
        let mergedSectors = item.compatible_sectors || [];
        if (Array.isArray(ai.compatible_sectors) && ai.compatible_sectors.length > 0) {
          const matched = ai.compatible_sectors
            .map((v: string) => resolveSectorSlug(v, sectors))
            .filter(Boolean);
          mergedSectors = matched.length > 0 ? matched : mergedSectors;
        }

        onUpdate({
          ...item,
          description: ai.short_description || ai.description || item.description || '',
          longDescription: ai.long_description || ai.longDescription || ai.body || item.longDescription || '',
          features: Array.isArray(ai.features) && ai.features.length > 0 ? ai.features : (item.features || []),
          seoTitle: ai.seo_title || ai.seoTitle || ai.meta_title || item.seoTitle || '',
          seoDescription: ai.seo_description || ai.seoDescription || ai.meta_description || item.seoDescription || '',
          timeline_stages: Array.isArray(ai.timeline_stages) && ai.timeline_stages.length > 0 ? ai.timeline_stages : (item.timeline_stages || []),
          compatible_sectors: mergedSectors,
        } as any);
      } else {
        throw new Error(responseData?.error || 'AI geçerli veri döndürmedi.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Yapay zeka hatası: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tab Navigasyonu */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              borderRadius: '9999px',
              border: activeTab === tab.id ? '1px solid #2563eb' : '1px solid #cbd5e1',
              background: activeTab === tab.id ? '#eff6ff' : '#f8fafc',
              color: activeTab === tab.id ? '#1d4ed8' : '#475569',
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab İçerikleri */}
      <div>
        {activeTab === 'general' && (
          <GeneralTab
            item={item}
            categories={categories}
            isNew={isNew}
            isCategory={isCategory}
            onUpdate={onUpdate}
          />
        )}
        {activeTab === 'content' && (
          <ContentTab
            item={item}
            isGenerating={isGenerating}
            onUpdate={onUpdate}
            onAiGenerate={handleAiGenerate}
          />
        )}
        {activeTab === 'seo' && (
          <SeoTab
            item={item}
            settings={settings}
            onUpdate={onUpdate}
          />
        )}
        {activeTab === 'faq' && (
          <FaqTab
            key={`faq-tab-${JSON.stringify(item.serviceFaqs || []).length}`}
            item={item}
            isCategory={isCategory}
            onUpdate={onUpdate}
          />
        )}
        {activeTab === 'advanced' && (
          <AdvancedTab
            item={item}
            sectors={sectors}
            settings={settings}
            isCategory={isCategory}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* Footer: Yayın Durumu */}
      <div className="admin-form-group">
        <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!item.active}
            onChange={e => onUpdate({ ...item, active: e.target.checked })}
          />
          Sitede Yayınla (Aktif)
        </label>
      </div>
    </div>
  );
}
