'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useAdminActions } from '@/app/admin/hooks/useAdminActions';
import ReferencesTabSections from '@/modules/admin/components/tabs/references/ReferencesTabSections';
import ItemEditorModal from '@/modules/admin/components/modals/ItemEditorModal';
import ReferenceForm from '@/modules/admin/components/tabs/ReferenceForm';

export default function ReferencesPage() {
  const {
    references,
    sectors,
    cities,
    services,
    fetchData,
    loading
  } = useAdminData(['references', 'services']);

  const { saving, setSaving } = useAdminActions(fetchData);

  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'reference' | null>(null);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Referans Yönetimi</h1>
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
          <h1>Referans Yönetimi</h1>
          <span className="admin-badge">{references.length} referans</span>
        </div>
      </div>

      <ReferencesTabSections
        references={references}
        onEdit={(reference) => { setEditItem(reference); setEditType('reference'); }}
        onDelete={async (id) => {
          if (confirm('Silmek istediğinize emin misiniz?')) {
            const response = await fetch(`/api/admin/references?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (response.ok) { toast.success('Referans silindi.'); await fetchData(); }
          }
        }}
        onCreate={() => {
          setEditItem({ 
            name: '', 
            sector: '', 
            city_slug: '', 
            city_name: '', 
            project_size: null,
            projectSummary: '', 
            description: '', 
            logoPath: '', 
            features: [], 
            active: true, 
            sort_order: references.length + 1, 
            featured: false, 
            _isNew: true 
          });
          setEditType('reference');
        }}
        onToggleActive={async (ref) => {
          const response = await fetch('/api/admin/references', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...ref, active: !ref.active }),
          });
          if (response.ok) {
            toast.success(!ref.active ? 'Referans aktife alındı.' : 'Referans pasife alındı.');
            await fetchData();
          } else {
            toast.error('Durum güncellenemedi.');
          }
        }}
      />

      {editType === 'reference' && (
        <ItemEditorModal
          title={editItem?._isNew ? 'Yeni Referans' : 'Referans Düzenle'}
          isOpen={true}
          onClose={() => { setEditItem(null); setEditType(null); }}
          onSave={async () => {
            setSaving(true);
            try {
              const response = await fetch('/api/admin/references', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editItem),
              });

              let result: any = null;
              const contentType = response.headers.get('content-type') || '';

              if (contentType.includes('application/json')) {
                result = await response.json();
              } else {
                result = await response.text();
              }

              if (!response.ok) {
                const errorMessage =
                  result?.error ||
                  result?.message ||
                  result?.details ||
                  (typeof result === 'string' ? result : undefined) ||
                  `HTTP ${response.status}`;
                throw new Error(errorMessage);
              }

              toast.success('Başarıyla kaydedildi.');
              setEditItem(null);
              setEditType(null);
              await fetchData();
            } catch (caughtError: unknown) {
              const error = caughtError instanceof Error
                ? caughtError
                : new Error(String(caughtError));

              console.error('[ReferencesPage] Save error:', error, {
                editItem,
              });
              toast.error(`Kayıt hatası: ${error.message || 'Bilinmeyen hata'}`);
            } finally {
              setSaving(false);
            }
          }}
          saving={saving}
        >
          <ReferenceForm
            item={editItem}
            sectors={sectors}
            cities={cities}
            services={services}
            onUpdate={(updated: any) => setEditItem(updated)}
            onFileUpload={() => { /* handle file upload */ }}
          />
        </ItemEditorModal>
      )}
    </div>
  );
}
