'use client';

import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useAdminActions } from '@/app/admin/hooks/useAdminActions';
import LegalTab from '@/modules/admin/components/tabs/LegalTab';

export default function LegalPage() {
  const { 
    legal, 
    setLegal,
    fetchData,
    loading 
  } = useAdminData(['legal']);
  
  const { handleSave, saving } = useAdminActions(fetchData);

  if (loading || !legal) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">Yasal Metin Yönetimi</h1>
      
      <LegalTab 
        legal={legal} 
        saving={saving} 
        onUpdate={setLegal} 
        onSave={() => handleSave('legal', legal)} 
      />
    </div>
  );
}
