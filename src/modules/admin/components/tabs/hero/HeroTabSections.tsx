'use client';

import CloudinaryImage from '@/shared/components/CloudinaryImage';
import { Plus, Trash2 } from 'lucide-react';
import type { HeroData } from '@/core/types';

interface HeroTabSectionsProps {
  hero: HeroData;
  onUpdate: (data: HeroData) => void;
  onOpenMediaLibrary: () => void;
}

interface HeroFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
}

function HeroSectionTitle({ children }: { children: string }) {
  return <h4 className="admin-settings-section-title">{children}</h4>;
}

function HeroField({ label, value, onChange, multiline = false, rows = 3 }: HeroFieldProps) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">{label}</label>
      {multiline ? (
        <textarea className="admin-textarea" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="admin-input" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}

export default function HeroTabSections({ hero, onUpdate, onOpenMediaLibrary }: HeroTabSectionsProps) {
  const updateLeft = (field: keyof HeroData['left'], value: string) => {
    onUpdate({
      ...hero,
      left: {
        ...hero.left,
        [field]: value,
      },
    });
  };

  const updateGalleryItem = <K extends keyof HeroData['gallery'][number]>(
    index: number,
    field: K,
    value: HeroData['gallery'][number][K]
  ) => {
    const gallery = [...(hero.gallery || [])];
    gallery[index] = {
      ...gallery[index],
      [field]: value,
    };

    onUpdate({
      ...hero,
      gallery,
    });
  };

  const removeGalleryItem = (index: number) => {
    onUpdate({
      ...hero,
      gallery: hero.gallery.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  return (
    <div className="admin-settings-grid">
      <section className="admin-settings-panel">
        <HeroSectionTitle>Yazili Icerik</HeroSectionTitle>

        <HeroField label="Ust Rozet (Badge)" value={hero.left?.badge || ''} onChange={(value) => updateLeft('badge', value)} />
        <HeroField label="Ana Baslik" value={hero.left?.title || ''} onChange={(value) => updateLeft('title', value)} multiline rows={2} />
        <HeroField
          label="Alt Aciklama"
          value={hero.left?.description || ''}
          onChange={(value) => updateLeft('description', value)}
          multiline
          rows={3}
        />

        <div className="admin-settings-two-col admin-hero-cta-grid">
          <HeroField
            label="Birincil Buton Metni"
            value={hero.left?.ctaText || ''}
            onChange={(value) => updateLeft('ctaText', value)}
          />
          <HeroField
            label="Birincil Buton Linki"
            value={hero.left?.ctaLink || ''}
            onChange={(value) => updateLeft('ctaLink', value)}
          />
        </div>
      </section>

      <section className="admin-settings-panel">
        <HeroSectionTitle>Gorsel Galerisi</HeroSectionTitle>

        <div className="admin-hero-gallery-list">
          {hero.gallery?.map((image, index) => (
            <div key={`${image.id ?? 'hero'}-${index}`} className="admin-hero-gallery-item">
              <div className="admin-hero-gallery-thumb">
                <CloudinaryImage src={image.path} alt={image.alt || 'Hero gorseli'} fill sizes="80px" className="admin-hero-gallery-image" />
              </div>

              <div className="admin-hero-gallery-content">
                <input
                  className="admin-input admin-hero-inline-input"
                  placeholder="Alt metin"
                  value={image.alt}
                  onChange={(event) => updateGalleryItem(index, 'alt', event.target.value)}
                />

                <div className="admin-hero-gallery-actions">
                  <select
                    className="admin-select admin-hero-inline-select"
                    value={image.size}
                    onChange={(event) => updateGalleryItem(index, 'size', event.target.value as HeroData['gallery'][number]['size'])}
                  >
                    <option value="small">Kucuk</option>
                    <option value="large">Buyuk</option>
                  </select>

                  <button onClick={() => removeGalleryItem(index)} className="admin-btn admin-btn-sm admin-btn-danger" title="Sil">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button onClick={onOpenMediaLibrary} className="admin-btn admin-btn-sm admin-btn-dashed">
            <Plus size={14} /> Yeni Gorsel Ekle
          </button>
        </div>
      </section>
    </div>
  );
}
