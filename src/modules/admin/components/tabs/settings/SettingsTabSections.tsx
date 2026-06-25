'use client';

import type { CategoryPageItemUiContent, SiteSettings } from '@/core/types';
import BrandSettings from './BrandSettings';
import SystemSettings from './SystemSettings';
import GeoSettings from './GeoSettings';
import ServiceUiSettings from './ServiceUiSettings';
import AiSettingsTab from '../AiSettingsTab';

interface SettingsSectionsProps {
  settings: SiteSettings;
  onUpdate: (data: SiteSettings) => void;
  activeTab: 'brand' | 'system' | 'geo' | 'ui' | 'ai';
  onSave?: () => void;
  saving?: boolean;
}

type CategoryPageKey = keyof SiteSettings['uiContent']['categoryPages'];

export default function SettingsTabSections({ settings, onUpdate, activeTab, onSave, saving }: SettingsSectionsProps) {
  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    onUpdate({
      ...settings,
      [key]: value,
    });
  };

  const updateUiSection = <K extends keyof SiteSettings['uiContent'], F extends keyof SiteSettings['uiContent'][K]>(
    section: K,
    field: F,
    value: SiteSettings['uiContent'][K][F]
  ) => {
    const sectionData = settings.uiContent[section];
    const isObject = sectionData && typeof sectionData === 'object' && !Array.isArray(sectionData);

    onUpdate({
      ...settings,
      uiContent: {
        ...settings.uiContent,
        [section]: isObject ? {
          ...(sectionData as any),
          [field]: value,
        } : value,
      },
    });
  };

  const updateCategoryPage = <F extends keyof CategoryPageItemUiContent>(
    category: CategoryPageKey,
    field: F,
    value: CategoryPageItemUiContent[F]
  ) => {
    onUpdate({
      ...settings,
      uiContent: {
        ...settings.uiContent,
        categoryPages: {
          ...settings.uiContent.categoryPages,
          [category]: {
            ...settings.uiContent.categoryPages[category],
            [field]: value,
          },
        },
      },
    });
  };
  return (
    <div className="admin-settings-grid">
      {activeTab === 'brand' && (
        <BrandSettings 
          settings={settings} 
          updateSetting={updateSetting} 
        />
      )}
      
      {activeTab === 'system' && (
        <SystemSettings 
          settings={settings} 
          updateSetting={updateSetting} 
        />
      )}

      {activeTab === 'geo' && (
        <GeoSettings 
          settings={settings} 
          updateSetting={updateSetting} 
          onUpdate={onUpdate}
        />
      )}

      {activeTab === 'ui' && (
        <ServiceUiSettings 
          settings={settings} 
          updateUiSection={updateUiSection} 
          updateCategoryPage={updateCategoryPage}
        />
      )}

      {activeTab === 'ai' && onSave && (
        <AiSettingsTab 
          settings={settings}
          setSettings={onUpdate}
          onSave={onSave}
          saving={saving || false}
        />
      )}
    </div>
  );
}
