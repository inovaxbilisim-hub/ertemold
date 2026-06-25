'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import FooterTab from '@/modules/admin/components/tabs/FooterTab';

export default function FooterPage() {
  const { 
    settings, 
    setSettings,
    fetchData,
    loading 
  } = useAdminData(['settings']);
  
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
      toast.success('Footer ayarları kaydedildi.');
      await fetchData();
    } catch {
      toast.error('Ayarlar kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">Footer Yönetimi</h1>
      
      <FooterTab 
        settings={settings} 
        saving={saving} 
        onUpdate={setSettings} 
        onSave={handleSaveSettings} 
      />
    </div>
  );
}
