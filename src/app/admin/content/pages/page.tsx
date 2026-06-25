'use client';

import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useRouter } from 'next/navigation';
import PageManagement from '@/modules/admin/components/tabs/PageManagement';

export default function PagesPage() {
  const router = useRouter();
  const { 
    pages, 
    fetchData,
    loading 
  } = useAdminData(['pages']);
  
  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Sayfa Yönetimi</h1>
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
          <h1>Sayfa Yönetimi</h1>
          <span className="admin-badge">{pages.length} sayfa</span>
        </div>
      </div>
      <PageManagement 
        pages={pages} 
        onRefresh={fetchData} 
        onEdit={(page) => router.push(`/admin/pages/edit/${page.id}`)}
      />
    </div>
  );
}
