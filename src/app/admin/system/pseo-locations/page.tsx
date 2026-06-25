'use client';

import LocationMetadataTab from '@/modules/admin/components/tabs/LocationMetadataTab';

export default function PseoLocationsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">pSEO Lokasyon Ayarları</h1>
      <LocationMetadataTab />
    </div>
  );
}
