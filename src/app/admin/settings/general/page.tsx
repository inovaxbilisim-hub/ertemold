'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useAdminActions } from '@/app/admin/hooks/useAdminActions';
import SettingsTabSections from '@/modules/admin/components/tabs/settings/SettingsTabSections';

type SettingsViewTab = 'brand' | 'system' | 'geo' | 'ui' | 'ai';

function GeneralSettingsContent() {
  const { 
    settings, 
    setSettings,
    fetchData,
    loading 
  } = useAdminData(['settings']);
  
  const { handleSave, saving } = useAdminActions(fetchData);
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') as SettingsViewTab | null;
  const [activeTab, setActiveTab] = useState<SettingsViewTab>('brand');

  useEffect(() => {
    if (tabParam && ['brand', 'system', 'geo', 'ui', 'ai'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const tabs: Array<{ id: SettingsViewTab; label: string }> = [
    { id: 'brand', label: 'Marka ve İletişim' },
    { id: 'system', label: 'Sistem ve pSEO' },
    { id: 'geo', label: 'GEO ve Varlık' },
    { id: 'ui', label: 'Arayüz Metinleri' },
    { id: 'ai', label: 'Yapay Zeka (AI)' },
  ];

  if (loading || !settings) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Genel Ayarlar</h1>
        <button 
          onClick={() => handleSave('settings', settings)}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
      
      <div className="flex gap-2 mb-8 bg-slate-100 p-2 rounded-2xl flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-200/50'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
        <SettingsTabSections 
          settings={settings} 
          onUpdate={setSettings} 
          activeTab={activeTab} 
          onSave={() => handleSave('settings', settings)}
          saving={saving}
        />
      </div>
    </div>
  );
}

export default function GeneralSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Yükleniyor...</div>}>
      <GeneralSettingsContent />
    </Suspense>
  );
}
