'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminData } from '@/app/admin/hooks/useAdminData';
import FaqTabSections from '@/modules/admin/components/tabs/faq/FaqTabSections';
import ItemEditorModal from '@/modules/admin/components/modals/ItemEditorModal';
import FaqForm from '@/modules/admin/components/tabs/FaqForm';

export default function FaqPage() {
  const { 
    faqs, 
    settings,
    setSettings,
    fetchData,
    loading 
  } = useAdminData(['faqs', 'settings']);
  
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'faq' | null>(null);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        toast.success('Ayarlar başarıyla kaydedildi.');
        await fetchData();
      } else {
        throw new Error('Kayıt sırasında bir hata oluştu!');
      }
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaq = async (item: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (response.ok) {
        toast.success('SSS başarıyla kaydedildi.');
        setEditItem(null);
        setEditType(null);
        await fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Kayıt sırasında bir hata oluştu!');
      }
    } catch (error) {
      toast.error('SSS kaydedilemedi.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Bu SSS\'yi silmek istediğinize emin misiniz?')) return;
    try {
      const response = await fetch(`/api/admin/faqs?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('SSS silindi.');
        await fetchData();
      } else {
        throw new Error('Silme işlemi başarısız');
      }
    } catch (error) {
      toast.error('SSS silinemedi.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>SSS Yönetimi</h1>
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
          <h1>SSS Yönetimi</h1>
          <span className="admin-badge">{faqs.length} soru</span>
        </div>
      </div>
      
      <FaqTabSections
        faqs={faqs}
        settings={settings}
        onUpdateSettings={setSettings}
        onSaveSettings={handleSaveSettings}
        onEdit={(faq) => { setEditItem(faq); setEditType('faq'); }}
        onDelete={handleDeleteFaq}
        onCreate={() => {
          setEditItem({
            id: '',
            question: '',
            answer: '',
            category: '',
            active: true,
            sortOrder: faqs.length + 1,
            _isNew: true,
          });
          setEditType('faq');
        }}
        saving={saving}
      />

      {editType === 'faq' && (
        <ItemEditorModal
          title={editItem?._isNew ? 'Yeni SSS' : 'SSS Düzenle'}
          isOpen={true}
          saving={saving}
          onSave={() => handleSaveFaq(editItem)}
          onClose={() => { setEditItem(null); setEditType(null); }}
        >
          <FaqForm
            item={editItem}
            onUpdate={(updated) => setEditItem(updated)}
          />
        </ItemEditorModal>
      )}
    </div>
  );
}
