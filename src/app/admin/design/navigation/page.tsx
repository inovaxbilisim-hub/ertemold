'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import NavigationTab from '@/modules/admin/components/tabs/NavigationTab';

export default function NavigationPage() {
  const { 
    settings, 
    setSettings,
    services, 
    pages, 
    legal,
    fetchData,
    loading 
  } = useAdminData(['settings', 'services', 'pages', 'legal']);
  
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Kayıt hatası');
      toast.success('Menü ayarları kaydedildi.');
      await fetchData();
    } catch {
      toast.error('Ayarlar kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Menü (Navigasyon) Yönetimi</h1>
            <span className="admin-badge">Yükleniyor</span>
          </div>
        </div>
        <div className="admin-loading"><div style={{ width: 24, height: 24, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'admin-spin 0.8s linear infinite' }} /> Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Menü (Navigasyon) Yönetimi</h1>
        </div>
      </div>
      
      <NavigationTab 
        settings={settings} 
        services={services} 
        pages={pages} 
        legal={legal} 
        saving={saving} 
        onUpdate={setSettings} 
        onSave={handleSaveSettings} 
      />
    </div>
  );
}
