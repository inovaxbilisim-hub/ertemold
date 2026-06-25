"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAdminActions(refreshSettings: () => Promise<void>) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (file: string, data: unknown, onComplete?: () => Promise<void>) => {
    setSaving(true);
    try {
      const endpoint = file === 'settings' ? '/api/admin/settings' : '/api/admin/data';
      const body = file === 'settings' ? data : { file, data };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Kayıt hatası');

      toast.success('Başarıyla kaydedildi.');
      if (file === 'settings') {
        await refreshSettings();
      }
      if (onComplete) await onComplete();
    } catch {
      toast.error('Kayıt sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleMultiSave = async (saves: { file: string; data: unknown }[]) => {
    setSaving(true);
    try {
      for (const { file, data } of saves) {
        const endpoint = file === 'settings' ? '/api/admin/settings' : '/api/admin/data';
        const body = file === 'settings' ? data : { file, data };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error('Kayıt hatası');
      }

      toast.success('Başarıyla kaydedildi.');
      
      if (saves.some(s => s.file === 'settings')) {
        await refreshSettings();
      }
    } catch {
      toast.error('Kayıt sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    callback: (path: string) => void, 
    folder?: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    try {
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yükleme başarısız');
      }
      const data = await response.json();
      const url = data.data?.url || data?.url; // Backward compatibility check
      if (url) {
        callback(url);
        toast.success('Dosya başarıyla yüklendi.');
      } else {
        throw new Error('URL yanıtta bulunamadı');
      }
    } catch {
      toast.error('Yükleme hatası.');
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return {
    saving,
    setSaving,
    handleSave,
    handleMultiSave,
    handleFileUpload,
    logout
  };
}
