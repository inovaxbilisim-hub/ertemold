'use client';

import type { Service, SiteSettings } from '@/core/types';

interface SeoTabProps {
  item: Partial<Service>;
  settings: SiteSettings | null | undefined;
  onUpdate: (item: Partial<Service>) => void;
}

export default function SeoTab({ item, settings, onUpdate }: SeoTabProps) {
  const previewH1 = [
    settings?.branches?.[0]?.city_name || 'Örnek Şehir',
    settings?.pseo_location_suffix || 'Bölgesinde',
    item.title || 'Hizmet Adı',
    item.pseo_service_suffix || settings?.pseo_service_suffix || '',
    item.pseo_action_verb || settings?.pseo_action_verb || '',
  ].filter(Boolean).join(' ');

  const previewH2 = (item.pseo_h2_template || 'Profesyonel {service} - {city}')
    .replace(/\{city\}/gi, 'Düzce')
    .replace(/\{service\}/gi, `${item.title || 'Hizmet Adı'} ${item.pseo_service_suffix || settings?.pseo_service_suffix || ''}`.trim());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Meta SEO */}
      <div className="admin-form-group">
        <label className="admin-label">SEO Başlığı (Opsiyonel)</label>
        <input
          type="text"
          className="admin-input"
          value={item.seoTitle || ''}
          onChange={e => onUpdate({ ...item, seoTitle: e.target.value })}
          placeholder="Örn: Profesyonel Zemin Kaplama Hizmetleri | Firma Adı"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label">SEO Açıklaması (Opsiyonel)</label>
        <textarea
          className="admin-textarea"
          value={item.seoDescription || ''}
          onChange={e => onUpdate({ ...item, seoDescription: e.target.value })}
          rows={2}
          placeholder="160 karaktere kadar meta açıklama..."
        />
      </div>

      {/* pSEO Ayarları */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="admin-form-group" style={{ marginBottom: 0 }}>
          <label className="admin-label">pSEO Eylem Kelimesi (Özel)</label>
          <input
            type="text"
            className="admin-input"
            value={item.pseo_action_verb || ''}
            onChange={e => onUpdate({ ...item, pseo_action_verb: e.target.value })}
            placeholder={settings?.pseo_action_verb ? `Varsayılan: ${settings.pseo_action_verb}` : 'Genel ayar tanımlanmamış...'}
          />
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Boş bırakılırsa genel ayar kullanılır.</p>
        </div>

        <div className="admin-form-group" style={{ marginBottom: 0 }}>
          <label className="admin-label">pSEO Hizmet Takısı (Özel)</label>
          <input
            type="text"
            className="admin-input"
            value={item.pseo_service_suffix || ''}
            onChange={e => onUpdate({ ...item, pseo_service_suffix: e.target.value })}
            placeholder={settings?.pseo_service_suffix ? `Varsayılan: ${settings.pseo_service_suffix}` : 'Genel ayar tanımlanmamış...'}
          />
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Boş bırakılırsa genel ayar kullanılır.</p>
        </div>
      </div>

      {/* Canlı Önizleme */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          CANLI ÖNİZLEME (ÖRNEK GÖRÜNÜM)
        </p>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>SAYFA BAŞLIĞI (H1):</p>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b', lineHeight: '1.3' }}>
            {previewH1}
          </h1>
        </div>

        <div style={{ paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>İÇERİK ALT BAŞLIĞI (H2):</p>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#334155', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#2563eb' }}>★</span>
            {previewH2}
          </h2>
        </div>
      </div>

      {/* H2 Şablonu */}
      <div className="admin-form-group">
        <label className="admin-label">pSEO H2 Alt Başlık Şablonu</label>
        <input
          type="text"
          className="admin-input"
          value={item.pseo_h2_template || ''}
          onChange={e => onUpdate({ ...item, pseo_h2_template: e.target.value })}
          placeholder="Profesyonel {service} - {city}"
        />
        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
          Değişkenler: <code>{'{city}'}</code>, <code>{'{service}'}</code>
        </p>
      </div>
    </div>
  );
}

