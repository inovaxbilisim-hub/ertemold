'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { HeroData } from '@/core/types';
import MediaLibraryModal from '../modals/MediaLibraryModal';
import HeroTabSections from './hero/HeroTabSections';

interface HeroTabProps {
  hero: HeroData;
  saving: boolean;
  onUpdate: (data: HeroData) => void;
  onSave: () => void;
  onFileUpload: (e: ChangeEvent<HTMLInputElement>, callback: (path: string) => void) => void;
}

export default function HeroTab({ hero, saving, onUpdate, onSave, onFileUpload: _onFileUpload }: HeroTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  void _onFileUpload;

  if (!hero) {
    return null;
  }

  return (
    <div className="admin-card">
      <div className="admin-toolbar">
        <div className="admin-settings-toggle">
          <input type="checkbox" id="hero-active" checked={hero.active} onChange={(event) => onUpdate({ ...hero, active: event.target.checked })} />
          <label htmlFor="hero-active" className="admin-label admin-settings-label-inline">
            Ana Sayfa Kahraman (Hero) Bolumu Aktif
          </label>
        </div>

        <button onClick={onSave} className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Hero Ayarlarini Kaydet'}
        </button>
      </div>

      <HeroTabSections hero={hero} onUpdate={onUpdate} onOpenMediaLibrary={() => setModalOpen(true)} />

      <MediaLibraryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(url) => {
          onUpdate({ ...hero, gallery: [...(hero.gallery || []), { id: Date.now(), path: url, alt: '', size: 'small' }] });
          setModalOpen(false);
        }}
      />
    </div>
  );
}
