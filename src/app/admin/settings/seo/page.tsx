'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import SeoTab from '@/modules/admin/components/tabs/SeoTab';

export default function SeoSettingsPage() {
  const { 
    settings, 
    setSettings,
    seo,
    setSeo,
    pages, 
    fetchData,
    loading 
  } = useAdminData(['settings', 'seo', 'pages', 'services', 'categories']);
  
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save global settings
      const settingsRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      // Save SEO metadata
      const seoRes = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seo),
      });

      if (!settingsRes.ok || !seoRes.ok) {
        const sErr = !settingsRes.ok ? await settingsRes.text() : '';
        const oErr = !seoRes.ok ? await seoRes.text() : '';
        throw new Error(`Kayıt hatası: Settings: ${sErr}, SEO: ${oErr}`);
      }
      toast.success('Tüm SEO ayarları başarıyla kaydedildi.');
      await fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error('Ayarlar kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Yükleniyor...</div>;
  }

  return (
    <>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '2rem', color: '#1e293b' }}>Gelişmiş SEO Yönetimi</h1>
      
      <SeoTab 
        seo={seo || {}}
        settings={settings} 
        pages={pages} 
        saving={saving} 
        onUpdate={setSeo} 
        onUpdateSettings={setSettings}
        onSave={handleSaveSettings} 
        onFileUpload={() => { /* handle file upload */ }}
      />
    </>
  );
}
