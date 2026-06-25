'use client';

import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useAdminActions } from '@/app/admin/hooks/useAdminActions';
import SectionManagement from '@/modules/admin/components/tabs/SectionManagement';

export default function SectionsPage() {
  const { 
    sections, 
    fetchData,
    loading 
  } = useAdminData(['sections']);
  const { handleSave, saving } = useAdminActions(fetchData);
  const { setSections } = useAdminData(['sections']);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Bölüm Yönetimi</h1>
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
          <h1>Bölüm Yönetimi</h1>
          <span className="admin-badge">{sections.length} bölüm</span>
        </div>
      </div>
      <SectionManagement 
        sections={sections} 
        onUpdate={setSections}
        onSave={() => handleSave('sections', sections)}
        saving={saving}
      />
    </div>
  );
}
