'use client';

import { useAdminData } from '@/app/admin/hooks/useAdminData';
import PseoTab from '@/modules/admin/components/tabs/PseoTab';

export default function PseoPage() {
  const { 
    settings,
    loading 
  } = useAdminData(['settings']);

  if (loading || !settings) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">pSEO Motoru Ayarları</h1>
      <PseoTab settings={settings} />
    </div>
  );
}
