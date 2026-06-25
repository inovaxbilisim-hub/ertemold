'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useAdminActions } from '@/app/admin/hooks/useAdminActions';
import HeroTab from '@/modules/admin/components/tabs/HeroTab';

export default function HeroPage() {
  const { 
    hero, 
    setHero,
    fetchData,
    loading 
  } = useAdminData(['hero']);
  
  const { saving: isSavingAction, setSaving } = useAdminActions(fetchData);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, folder = 'hero-gallery') => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    setIsUploading(true);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Yükleme hatası');
      const data = await res.json();
      callback(data.url);
      toast.success('Görsel yüklendi.');
    } catch {
      toast.error('Görsel yüklenemedi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleHeroSave = async () => {
    if (!hero) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...hero,
          galleryLayout: hero.galleryLayout || 'masonry',
          galleryCount: hero.galleryCount ?? 4,
        })
      });
      if (res.ok) {
        toast.success('Hero güncellendi.');
        await fetchData();
      } else {
        throw new Error('Kayıt başarısız');
      }
    } catch (err) {
      toast.error('Hata: ' + (err instanceof Error ? err.message : 'Kayıt başarısız'));
    } finally {
      setSaving(false);
    }
  };

  const saving = isSavingAction || isUploading;

  if (loading || !hero) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">Hero (Ana Manşet) Yönetimi</h1>
      
      <HeroTab 
        hero={hero} 
        saving={saving} 
        onUpdate={setHero} 
        onSave={handleHeroSave} 
        onFileUpload={(event, callback) => handleFileUpload(event, callback, 'hero-gallery')} 
      />
    </div>
  );
}
