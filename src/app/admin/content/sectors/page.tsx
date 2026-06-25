'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useAdminActions } from '@/app/admin/hooks/useAdminActions';
import SectorsTab from '@/modules/admin/components/tabs/SectorsTab';
import ItemEditorModal from '@/modules/admin/components/modals/ItemEditorModal';
import SectorForm from '@/modules/admin/components/tabs/SectorForm';
import { Sector } from '@/core/types';

export default function SectorsPage() {
  const { 
    fetchData,
    loading 
  } = useAdminData([]);
  
  const { saving } = useAdminActions(fetchData);

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorLoading, setSectorLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'category' | null>(null);

  const loadSectors = async () => {
    setSectorLoading(true);
    try {
      const response = await fetch('/api/admin/sectors', { cache: 'no-store' });
      if (!response.ok) throw new Error('Sektörler yüklenemedi');
      const result = await response.json();
      setSectors(result.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Sektörler yüklenirken bir hata oluştu.');
    } finally {
      setSectorLoading(false);
    }
  };

  useEffect(() => {
    void loadSectors();
  }, []);

  if (loading || sectorLoading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Sektörler Yönetimi</h1>
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
          <h1>Sektörler Yönetimi</h1>
          <span className="admin-badge">{sectors.length} sektör</span>
        </div>
      </div>
      
      <SectorsTab
        sectors={sectors}
        onRefresh={loadSectors}
        onEdit={(sector: Sector) => { setEditItem(sector); setEditType('category'); }}
        onDelete={async (id: string) => {
          if (confirm('Silmek istediğinize emin misiniz?')) {
            const response = await fetch(`/api/admin/sectors?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
              toast.success('Sektör silindi.');
              await loadSectors();
            }
          }
        }}
        onCreate={() => {
          setEditItem({ id: '', name: '', slug: '', image_path: '', active: true, sort_order: sectors.length + 1, _isNew: true } as any);
          setEditType('category');
        }}
      />

      {editType === 'category' && (
        <ItemEditorModal
          title={editItem?._isNew ? 'Yeni Kategori/Sektör' : 'Kategori/Sektör Düzenle'}
          isOpen={true}
          onClose={() => { setEditItem(null); setEditType(null); }}
          onSave={async () => {
            try {
              const res = await fetch('/api/admin/sectors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editItem)
              });
              
              if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Kayıt başarısız');
              }
              
              toast.success('Sektör başarıyla kaydedildi.');
              setEditItem(null); setEditType(null);
              await loadSectors();
            } catch (err: any) {
              toast.error(err.message || 'Kayıt sırasında bir hata oluştu.');
            }
          }}
          saving={saving}
        >
          <SectorForm
            item={editItem}
            onUpdate={(updated: any) => setEditItem(updated)}
            onFileUpload={() => { /* handle file upload */ }}
          />
        </ItemEditorModal>
      )}
    </div>
  );
}
