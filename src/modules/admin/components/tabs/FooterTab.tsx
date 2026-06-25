'use client';

import type { SiteSettings } from '@/core/types';
import FooterTabSections from './footer/FooterTabSections';

interface FooterTabProps {
  settings: SiteSettings;
  saving: boolean;
  onUpdate: (data: SiteSettings) => void;
  onSave: () => void;
}

export default function FooterTab({ settings, saving, onUpdate, onSave }: FooterTabProps) {
  return (
    <div className="admin-card">
      <div className="admin-toolbar">
        <div />
        <button onClick={onSave} className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Kaydediliyor...' : "Footer'i Kaydet"}
        </button>
      </div>

      <FooterTabSections settings={settings} onUpdate={onUpdate} />
    </div>
  );
}
