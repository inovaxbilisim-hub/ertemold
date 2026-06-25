'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useAdminActions } from '@/app/admin/hooks/useAdminActions';
import BranchManagement from '@/modules/admin/components/tabs/BranchManagement';
import ItemEditorModal from '@/modules/admin/components/modals/ItemEditorModal';
import BranchForm from '@/modules/admin/components/tabs/BranchForm';

export default function BranchesPage() {
  const { 
    branches, 
    fetchData,
    loading 
  } = useAdminData(['branches']);
  
  const { saving, setSaving } = useAdminActions(fetchData);

  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'branch' | null>(null);
  const [activeBranchCity, setActiveBranchCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">Şube Yönetimi</h1>
      
      <BranchManagement
        branches={branches}
        activeBranchCity={activeBranchCity}
        searchQuery={searchQuery}
        saving={saving}
        onCityChange={setActiveBranchCity}
        onSearchQueryChange={setSearchQuery}
        onEdit={(branch) => { setEditItem(branch); setEditType('branch'); }}
        onDelete={async (id) => {
          if (confirm('Silmek istediğinize emin misiniz?')) {
            const response = await fetch(`/api/admin/locations?id=${id}`, { method: 'DELETE' });
            if (response.ok) { toast.success('Şube silindi.'); await fetchData(); }
          }
        }}
        onCreate={() => {
          setEditItem({ id: '', title: '', type: 'sube', address: '', phone: '', email: '', maps_link: '', active: true, sort_order: branches.length + 1, _isNew: true });
          setEditType('branch');
        }}
      />

      {editType === 'branch' && (
        <ItemEditorModal
          title={editItem?._isNew ? 'Yeni Şube/Bölge' : 'Şube/Bölge Düzenle'}
          isOpen={true}
          onClose={() => { setEditItem(null); setEditType(null); }}
          onSave={async () => {
            setSaving(true);
            try {
              const res = await fetch('/api/admin/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editItem)
              });
              if (res.ok) {
                toast.success('Şube başarıyla kaydedildi.');
                setEditItem(null); setEditType(null);
                await fetchData();
              } else {
                throw new Error('Kayıt başarısız');
              }
            } catch (err) {
              toast.error('Hata: ' + (err instanceof Error ? err.message : 'Kayıt başarısız'));
            } finally {
              setSaving(false);
            }
          }}
          saving={saving}
        >
          <BranchForm
            item={editItem}
            onUpdate={(updated: any) => setEditItem(updated)}
          />
        </ItemEditorModal>
      )}
    </div>
  );
}
