'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Stat } from '@/core/types';

interface StatsTabSectionsProps {
  stats: Stat[];
  onUpdate: (data: Stat[]) => void;
}

export default function StatsTabSections({ stats, onUpdate }: StatsTabSectionsProps) {
  return (
    <div className="admin-stats-stack">
      <p className="admin-section-description">Sitedeki sayac rakamlarini ve istatistikleri yonetin.</p>

      {(stats || []).map((stat, index) => (
        <div key={`${stat.id || 'stat'}-${index}`} className="admin-stats-row">
          <div className="admin-form-group admin-form-group-compact">
            <label className="admin-label admin-label-small">Etiket (orn: Mutlu Musteri)</label>
            <input
              type="text"
              className="admin-input"
              value={stat.label}
              onChange={(event) => {
                const next = [...stats];
                next[index].label = event.target.value;
                onUpdate(next);
              }}
            />
          </div>
          <div className="admin-form-group admin-form-group-compact">
            <label className="admin-label admin-label-small">Deger (orn: 1500+)</label>
            <input
              type="text"
              className="admin-input"
              value={stat.value}
              onChange={(event) => {
                const next = [...stats];
                next[index].value = event.target.value;
                onUpdate(next);
              }}
            />
          </div>
          <div className="admin-form-group admin-form-group-compact">
            <label className="admin-label admin-label-small">Siralama</label>
            <input
              type="number"
              className="admin-input"
              value={stat.order || 0}
              onChange={(event) => {
                const next = [...stats];
                next[index].order = Number.parseInt(event.target.value, 10) || 0;
                onUpdate(next);
              }}
            />
          </div>
          <button onClick={() => onUpdate(stats.filter((_, currentIndex) => currentIndex !== index))} className="admin-btn admin-btn-sm admin-btn-danger">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        onClick={() => onUpdate([...(stats || []), { id: Date.now().toString(), label: 'Yeni Istatistik', value: '100', order: stats?.length || 0 }])}
        className="admin-btn admin-btn-sm admin-btn-dashed admin-stats-add"
      >
          <Plus size={14} /> Yeni Istatistik Ekle
      </button>
    </div>
  );
}
