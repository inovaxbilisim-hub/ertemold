'use client';

import type { LegalPage, Page, Service, SiteSettings } from '@/core/types';
import NavigationTabSections from './navigation/NavigationTabSections';

interface NavigationTabProps {
  settings: SiteSettings;
  services: Service[];
  pages: Page[];
  legal: Record<string, LegalPage> | null;
  saving: boolean;
  onUpdate: (data: SiteSettings) => void;
  onSave: () => void;
}

export default function NavigationTab({ settings, services, pages, legal, saving, onUpdate, onSave }: NavigationTabProps) {
  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={onSave} className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Menuleri Kaydet'}
        </button>
      </div>

      <NavigationTabSections settings={settings} services={services} pages={pages} legal={legal} onUpdate={onUpdate} />
    </div>
  );
}
