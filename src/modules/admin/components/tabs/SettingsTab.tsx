'use client';

import { useState, type ChangeEvent } from 'react';
import type { SiteSettings } from '@/core/types';
import SettingsTabSections from './settings/SettingsTabSections';

  type SettingsViewTab = 'brand' | 'system' | 'geo' | 'ui';
  
  interface SettingsTabProps {
    settings: SiteSettings;
    saving: boolean;
    onUpdate: (data: SiteSettings) => void;
    onSave: () => void;
    onFileUpload: (e: ChangeEvent<HTMLInputElement>, callback: (path: string) => void) => void;
  }
  
  export default function SettingsTab({ settings, saving, onUpdate, onSave, onFileUpload: _onFileUpload }: SettingsTabProps) {
    void _onFileUpload;
    const [activeTab, setActiveTab] = useState<SettingsViewTab>('brand');
    const tabs: Array<{ id: SettingsViewTab; label: string }> = [
      { id: 'brand', label: 'Marka ve İletişim' },
      { id: 'system', label: 'Sistem ve pSEO' },
      { id: 'geo', label: 'GEO ve Varlık' },
      { id: 'ui', label: 'Arayüz Metinleri' },
    ];

  return (
    <div className="admin-card">
      <div className="admin-actions">
        <button onClick={onSave} className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
        </button>
      </div>

      <div className="admin-settings-tabs" role="tablist" aria-label="Genel ayarlar sekmeleri">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`admin-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <SettingsTabSections settings={settings} onUpdate={onUpdate} activeTab={activeTab} />
    </div>
  );
}
