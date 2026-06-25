'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Service, ServiceCategory } from '@/core/types';
import AdminImagePicker from '../../AdminImagePicker';
import { SERVICE_COLOR_OPTIONS } from './types';
import { slugify } from './utils';

interface GeneralTabProps {
  item: Partial<Service>;
  categories: ServiceCategory[];
  isNew: boolean;
  isCategory: boolean;
  onUpdate: (item: Partial<Service>) => void;
}

export default function GeneralTab({ item, categories, isNew, isCategory, onUpdate }: GeneralTabProps) {
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'exists' | 'available'>('idle');

  useEffect(() => {
    if (!item.slug || item.slug.length < 2 || !isNew) {
      setSlugStatus('idle');
      return;
    }
    const timer = setTimeout(async () => {
      setSlugStatus('checking');
      try {
        const res = await fetch(`/api/admin/check-slug?type=service&slug=${item.slug}`);
        const data = await res.json();
        setSlugStatus(data.exists ? 'exists' : 'available');
      } catch {
        setSlugStatus('idle');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [item.slug, isNew]);

  const handleTitleChange = (newTitle: string) => {
    const updates: Partial<Service> = { title: newTitle };
    if (isNew) updates.slug = slugify(newTitle);
    onUpdate({ ...item, ...updates });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Başlık + Slug */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="admin-form-group">
          <label className="admin-label">Hizmet Başlığı</label>
          <input
            type="text"
            className="admin-input"
            value={item.title || ''}
            onChange={e => handleTitleChange(e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            Slug (URL)
            {slugStatus === 'exists' && (
              <span style={{ color: '#ef4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> Mevcut!
              </span>
            )}
            {slugStatus === 'available' && (
              <span style={{ color: '#10b981', fontSize: '11px' }}>Uygun ✓</span>
            )}
          </label>
          <input
            type="text"
            className={`admin-input ${slugStatus === 'exists' ? 'admin-input-error' : ''}`}
            value={item.slug || ''}
            onChange={e => onUpdate({ ...item, slug: e.target.value })}
            placeholder="hizmet-slug"
          />
        </div>

        {!isCategory && (
          <div className="admin-form-group">
            <label className="admin-label">Kategori</label>
            <select
              className="admin-select"
              value={item.category_id || ''}
              onChange={e => onUpdate({ ...item, category_id: parseInt(e.target.value) })}
            >
              <option value="" disabled>Kategori Seçin</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {!isCategory && (
          <div className="admin-form-group">
            <label className="admin-label">Renk Teması</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SERVICE_COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdate({ ...item, color: opt.value })}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: item.color === opt.value ? 'var(--bg-quaternary)' : 'var(--bg-primary)',
                    border: item.color === opt.value ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sıralama + İkon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="admin-form-group">
          <label className="admin-label">Sıralama</label>
          <input
            type="number"
            className="admin-input"
            value={item.sortOrder || 0}
            onChange={e => onUpdate({ ...item, sortOrder: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">İkon Adı (Lucide)</label>
          <input
            type="text"
            className="admin-input"
            value={item.icon || ''}
            onChange={e => onUpdate({ ...item, icon: e.target.value })}
            placeholder="örn: Wrench, Paintbrush, Building2"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">İkon Rengi</label>
          <input
            type="text"
            className="admin-input"
            value={item.iconColor || ''}
            onChange={e => onUpdate({ ...item, iconColor: e.target.value })}
            placeholder="#hex veya class adı"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">İkon Arka Plan Rengi</label>
          <input
            type="text"
            className="admin-input"
            value={item.iconBgColor || ''}
            onChange={e => onUpdate({ ...item, iconBgColor: e.target.value })}
            placeholder="#hex veya class adı"
          />
        </div>
      </div>

      {/* Görsel */}
      <div className="admin-form-group">
        <label className="admin-label">Hizmet Görseli (Hero / Card)</label>
        <AdminImagePicker
          value={item.imagePath || ''}
          onChange={path => onUpdate({ ...item, imagePath: path })}
        />
      </div>
    </div>
  );
}
