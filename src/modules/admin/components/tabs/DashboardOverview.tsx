'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Monitor, BarChart3, Activity, CalendarDays, Calendar, PhoneCall, MapPinned, Trash2, Loader2, Search, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { AnalyticsData } from '@/core/types';

interface DashboardOverviewProps {
  servicesCount: number;
  referencesCount: number;
  statsCount: number;
  onTabChange: (tab: any) => void;
}

interface EntityCounts {
  total: number;
  types: { type: string; count: number }[];
}

interface EntityStats {
  entities: EntityCounts;
  mediaCount: number;
}

function SkeletonCard() {
  return (
    <div className="admin-skeleton" style={{ height: 120 }} />
  );
}

function StatCard({ icon: Icon, iconColor, label, value, sub, accent = false }: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="admin-card"
      style={{ borderLeft: accent ? `3px solid var(--color-success)` : `3px solid ${iconColor}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} color={iconColor} />
        <span className="admin-entity-badge" style={{ color: iconColor, background: `${iconColor}15`, fontSize: '0.65rem' }}>{label}</span>
      </div>
      <p style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
        {value}
      </p>
      {sub && (
        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</p>
      )}
    </motion.div>
  );
}

function EntityCard({ label, count, color, onClick }: {
  label: string;
  count: number | string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="admin-entity-card"
      onClick={onClick}
    >
      <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color, margin: 0 }}>{count}</p>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-primary)' }}>
        Düzenle <ArrowRight size={12} />
      </div>
    </motion.div>
  );
}

function PeriodPill({ label, value, tone }: { label: string; value: number; tone: 'blue' | 'orange' | 'teal' }) {
  const colors: Record<string, string> = {
    blue: 'rgba(37,99,235,0.1)',
    orange: 'rgba(249,115,22,0.1)',
    teal: 'rgba(20,184,166,0.1)',
  };
  const textColors: Record<string, string> = {
    blue: '#2563eb',
    orange: '#f97316',
    teal: '#14b8a6',
  };

  return (
    <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: colors[tone], textAlign: 'center' }}>
      <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: textColors[tone], marginBottom: 2 }}>{label}</span>
      <strong style={{ fontSize: '1rem', fontWeight: 700, color: textColors[tone] }}>{value}</strong>
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
      {data.map((item) => (
        <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.value}</span>
          <div
            style={{
              width: '100%',
              borderRadius: '4px 4px 0 0',
              background: 'linear-gradient(to top, var(--color-primary), var(--color-primary-light))',
              height: `${(item.value / maxVal) * 100}%`,
              minHeight: item.value > 0 ? '4px' : '0px',
              transition: 'height 0.5s ease'
            }}
          />
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardOverview({ servicesCount, referencesCount, statsCount, onTabChange }: DashboardOverviewProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [entityStats, setEntityStats] = useState<EntityStats | null>(null);

  const fetchEntityStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        setEntityStats({ entities: { total: 0, types: [] }, mediaCount: 0 });
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEntityStats({ entities: { total: data.data.length, types: [] }, mediaCount: 0 });
      }
    } catch {
      setEntityStats({ entities: { total: 0, types: [] }, mediaCount: 0 });
    }
  };

  const fetchAnalytics = () => {
    setAnalyticsLoading(true);
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(response => {
        if (response.success && response.data) {
          setAnalytics(response.data);
        } else {
          toast.error('Analiz verileri alınamadı.');
        }
        setAnalyticsLoading(false);
      })
      .catch(() => {
        toast.error('Analiz verileri alınırken bir hata oluştu.');
        setAnalyticsLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
    fetchEntityStats();
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleResetAnalytics = async () => {
    if (!confirm('Tüm analitik verileri kalıcı olarak silinecektir. Emin misiniz?')) return;
    setResetting(true);
    try {
      const response = await fetch('/api/admin/analytics/reset', { method: 'POST' });
      if (response.ok) {
        toast.success('Analitik verileri sıfırlandı.');
        fetchAnalytics();
      } else {
        toast.error('Sıfırlama işlemi başarısız oldu.');
      }
    } catch {
      toast.error('Bir hata oluştu.');
    } finally {
      setResetting(false);
    }
  };

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const weeklyData = weekDays.map((day, i) => ({
    label: day,
    value: analytics?.dailyBreakdown?.[i] ?? 0,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LayoutDashboard size={24} style={{ color: 'var(--color-primary)' }} />
            Dashboard
          </span>
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Site istatistikleri ve içerik yönetimi
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="admin-page-hero">
          <div className="admin-page-hero-card">
            <h2>Hızlı Bakış</h2>
            <p>Panelinize gelen ana metrikler ve yönetim kısayolları.</p>
          </div>
          <div className="admin-quick-actions">
            <button className="admin-quick-action-card" type="button" onClick={() => onTabChange('services')}>
              <span>İçerik</span>
              <strong>Hizmetleri güncelle</strong>
              <small>Hizmetlerinizin sıralamasını hızlıca yönetin.</small>
            </button>
            <button className="admin-quick-action-card" type="button" onClick={() => onTabChange('settings')}>
              <span>Ayarlar</span>
              <strong>Site ayarlarını aç</strong>
              <small>Genel ayarlar ve SEO kontrolü için hızlı erişim.</small>
            </button>
            <button className="admin-quick-action-card" type="button" onClick={() => handleResetAnalytics()}>
              <span>Veriler</span>
              <strong>Analizi sıfırla</strong>
              <small>Analitik verilerini sıfırlayın.</small>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content Cards */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <LayoutDashboard size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>İçerik Yönetimi</h2>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            <EntityCard label="Hizmetler" count={servicesCount} color="var(--color-primary)" onClick={() => onTabChange('services')} />
            <EntityCard label="Referanslar" count={referencesCount} color="#7c3aed" onClick={() => onTabChange('references')} />
            <EntityCard label="İstatistikler" count={statsCount} color="#f59e0b" onClick={() => onTabChange('stats')} />
            <EntityCard label="Toplam Entity" count={entityStats?.entities?.total ?? '-'} color="#10b981" onClick={() => onTabChange('entities')} />
          </div>
        )}
      </motion.section>

      {/* Analytics */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Analizler</h2>
          </div>
          <button
            onClick={handleResetAnalytics}
            disabled={resetting}
            className="admin-btn admin-btn-danger admin-btn-sm"
          >
            {resetting ? <Loader2 size={14} style={{ animation: 'admin-spin 0.8s linear infinite' }} /> : <Trash2 size={14} />}
            Sıfırla
          </button>
        </div>

        {analyticsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              <StatCard icon={Monitor} iconColor="#0ea5e9" label="Anlık Ziyaretçi" value={analytics?.activeUsers || 0} />
              <StatCard icon={Calendar} iconColor="#3b82f6" label="Bugün" value={analytics?.dailyVisits || 0} />
              <StatCard icon={CalendarDays} iconColor="#f97316" label="Bu Hafta" value={analytics?.weeklyVisits || 0} />
              <StatCard icon={BarChart3} iconColor="#14b8a6" label="Bu Ay" value={analytics?.monthlyVisits || 0} />
              <StatCard icon={PhoneCall} iconColor="#3b82f6" label="Telefon" value={analytics?.phoneClicksTotal || 0}
                sub={`Bugün: ${analytics?.phoneClicksToday || 0} | Hafta: ${analytics?.phoneClicksThisWeek || 0}`}
              />
              <StatCard icon={Activity} iconColor="#22c55e" label="WhatsApp" value={analytics?.whatsappClicksTotal || 0}
                sub={`Bugün: ${analytics?.whatsappClicksToday || 0} | Hafta: ${analytics?.whatsappClicksThisWeek || 0}`}
                accent
              />
            </div>

            {/* Weekly Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="admin-card"
              style={{ marginTop: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Haftalık Ziyaret Trendi</h3>
              </div>
              <MiniBarChart data={weeklyData} />
            </motion.div>
          </>
        )}
      </motion.section>

      {/* Branch Interactions */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPinned size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Şubeye Göre Etkileşimler</h2>
          </div>
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Şehir veya şube ara..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: 32, height: 36, fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {analyticsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : analytics?.phoneClicksByBranch?.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
            {analytics.phoneClicksByBranch
              .filter(branch => {
                if (!cityFilter.trim()) return true;
                const q = cityFilter.toLocaleLowerCase('tr-TR');
                return (branch.branchTitle || '').toLocaleLowerCase('tr-TR').includes(q) ||
                       (branch.cityName || '').toLocaleLowerCase('tr-TR').includes(q);
              })
              .map((branch) => {
                const branchLabel = branch.branchTitle || branch.cityName || 'Genel Hat';
                return (
                  <motion.div
                    key={`${branch.branchId}-${branch.phone}-${branch.citySlug}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="admin-card"
                    style={{ padding: 20 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{branchLabel}</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                          {branch.cityName || 'Tüm lokasyonlar'} {branch.phone ? `| ${branch.phone}` : ''}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Toplam</span>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{branch.totalClicks}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#16a34a' }}>WhatsApp Tıklaması</span>
                      <strong style={{ fontSize: '0.9rem', color: '#16a34a', marginLeft: 'auto' }}>{branch.whatsappClicks || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <PeriodPill label="Bugün" value={branch.dailyClicks} tone="blue" />
                      <PeriodPill label="Hafta" value={branch.weeklyClicks} tone="orange" />
                      <PeriodPill label="Ay" value={branch.monthlyClicks} tone="teal" />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        ) : (
          <div className="admin-empty" style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <MapPinned size={32} />
            <p>Henüz etkileşim kaydı yok.</p>
          </div>
        )}
      </motion.section>
    </div>
  );
}
