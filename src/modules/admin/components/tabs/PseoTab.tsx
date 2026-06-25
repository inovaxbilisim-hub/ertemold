"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Globe, MapPin } from 'lucide-react';

interface PagesStats {
  services: number;
  sectors: number;
  locations: number;
  potential: number;
}

export default function PseoTab({ settings: _settings }: { settings?: unknown } = {}) {
  const [loading, setLoading] = useState(true);
  const [pagesStats, setPagesStats] = useState<PagesStats>({
    services: 0,
    sectors: 0,
    locations: 0,
    potential: 0,
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pseo/pages?statsOnly=true');
      if (res.ok) {
        const { data } = await res.json();
        if (data) {
          setPagesStats({
            potential: data.stats?.potential || 0,
            services: data.services_count || 0,
            sectors: data.sectors_count || 0,
            locations: data.locations_count || 1003,
          });
        }
      }
    } catch {
      toast.error('İstatistikler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOptimize = async () => {
    if (!confirm('Sitemap ve yapılandırma ayarları optimize edilecek. Devam edilsin mi?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pseo/optimize', { method: 'POST' });
      if (res.ok) {
        toast.success('Sistem başarıyla optimize edildi.');
        await fetchStats();
      }
    } catch {
      toast.error('Optimizasyon hatası');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-card" style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
  }

  return (
    <div className="admin-card-list-stack">
      <div className="admin-card">
        <div className="admin-toolbar">
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>pSEO Motoru</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Şehir ve hizmet kombinasyonları için otomatik sayfa üretimi. Her sayfa için gerçek veri temelli içerik sağlanır.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="admin-btn admin-btn-outline" onClick={handleOptimize}>
              <RefreshCw size={16} /> Yapıyı Optimize Et
            </button>
            <button className="admin-btn admin-btn-outline" onClick={fetchStats} title="Yenile">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-settings-auto-grid" style={{ marginTop: '24px' }}>
          <div className="admin-entity-card" style={{ padding: '24px', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
            <div className="admin-label">Toplam Erişim Gücü</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)' }}>
              {(pagesStats.potential || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mevcut ayarlarla üretilen toplam link</div>
            <Globe size={40} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }} />
          </div>

          <div className="admin-entity-card" style={{ padding: '24px', flexDirection: 'column', gap: '8px' }}>
            <div className="admin-label">Aktif Hizmetler</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent-blue)' }}>
              {pagesStats.services}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Her biri şehir bazlı sayfalara ayrılır</div>
          </div>

          <div className="admin-entity-card" style={{ padding: '24px', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
            <div className="admin-label">Lokasyon Kapsamı</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#10b981' }}>
              {pagesStats.locations || 1003}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>81 İl + ilçe kombinasyonları</div>
            <MapPin size={40} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }} />
          </div>
        </div>

        {/* Content strategy note */}
        <div className="admin-card" style={{ background: 'var(--bg-secondary)', border: 'none', marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>İçerik Stratejisi</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Şehir FAQ'ları</div>
              <div style={{ color: 'var(--text-muted)' }}>Her şehir+hizmet için AI ile üretilmiş, şehre özel SSS'ler.</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Endüstri Profili</div>
              <div style={{ color: 'var(--text-muted)' }}>Gerçek proje ve OSB verilerine dayalı şehir endüstri analizi.</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Content Quality</div>
              <div style={{ color: 'var(--text-muted)' }}>Yetersiz verili şehirler ana hizmet sayfasına yönlendirilir.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
