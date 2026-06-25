'use client';

import type { Stat } from '@/core/types';
import StatsTabSections from './stats/StatsTabSections';

interface StatsTabProps {
  stats: Stat[];
  saving: boolean;
  onUpdate: (data: Stat[]) => void;
  onSave: () => void;
}

export default function StatsTab({ stats, saving, onUpdate, onSave }: StatsTabProps) {
  return (
    <div className="admin-card">
      <div className="admin-toolbar">
        <div />
        <button onClick={onSave} className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Istatistikleri Kaydet'}
        </button>
      </div>

      <StatsTabSections stats={stats} onUpdate={onUpdate} />
    </div>
  );
}
