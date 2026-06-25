'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/modules/admin/components/Sidebar';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import { useAdminActions } from './hooks/useAdminActions';
import { usePathname } from 'next/navigation';
import { Menu, RefreshCw } from 'lucide-react';
import AdminErrorBoundary from './components/AdminErrorBoundary';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { settings, refreshSettings } = useSettings();
  const { logout } = useAdminActions(refreshSettings);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [revalidateStatus, setRevalidateStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const isLogin = pathname === '/admin/login';
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  const handleRevalidate = useCallback(async () => {
    if (revalidating) return;
    setRevalidating(true);
    setRevalidateStatus('idle');
    try {
      const res = await fetch('/api/admin/revalidate', { method: 'POST' });
      setRevalidateStatus(res.ok ? 'success' : 'error');
    } catch {
      setRevalidateStatus('error');
    } finally {
      setRevalidating(false);
      setTimeout(() => setRevalidateStatus('idle'), 2500);
    }
  }, [revalidating]);

  const activeTab = pathname === '/admin' ? 'dashboard' : pathname.split('/').pop() || 'dashboard';

  return (
    <AdminErrorBoundary>
      <div className={isLogin ? '' : 'admin-container'}>
        {!isLogin && (
          <>
            <div className="admin-top-bar">
              <div className="admin-top-bar-brand">
                <div className="admin-top-bar-logo">{(settings?.companyName || 'A')[0]}</div>
                <span className="admin-top-bar-title">{settings?.companyName || 'Admin Panel'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className={`admin-cache-btn${revalidateStatus === 'success' ? ' success' : revalidateStatus === 'error' ? ' error' : ''}`}
                  onClick={handleRevalidate}
                  disabled={revalidating}
                  aria-label="Cache'i temizle"
                  title="Cache'i yenile"
                >
                  <RefreshCw size={16} className={revalidating ? 'admin-cache-spin' : ''} />
                </button>
                <button className="admin-hamburger-btn" onClick={openSidebar} aria-label="Menüyü aç">
                  <Menu size={20} />
                </button>
              </div>
            </div>

            <div className="admin-cache-corner">
              <button
                className={`admin-cache-btn admin-cache-btn-lg${revalidateStatus === 'success' ? ' success' : revalidateStatus === 'error' ? ' error' : ''}`}
                onClick={handleRevalidate}
                disabled={revalidating}
                aria-label="Cache'i temizle"
                title="Cache'i yenile"
              >
                <RefreshCw size={16} className={revalidating ? 'admin-cache-spin' : ''} />
                <span className="admin-cache-btn-label">
                  {revalidating ? 'Yenileniyor...' : revalidateStatus === 'success' ? 'Yenilendi' : revalidateStatus === 'error' ? 'Hata' : 'Yenile'}
                </span>
              </button>
            </div>

            <div className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar} aria-hidden="true" />

            <Sidebar
              activeTab={activeTab}
              onTabChange={() => {}}
              onLogout={logout}
              isOpen={sidebarOpen}
              onClose={closeSidebar}
            />
          </>
        )}
        <main className={isLogin ? '' : 'admin-main'}>
          {children}
        </main>
      </div>
    </AdminErrorBoundary>
  );
}
