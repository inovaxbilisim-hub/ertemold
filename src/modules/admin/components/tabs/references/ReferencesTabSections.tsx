'use client';

import { useState } from 'react';
import { Edit2, Plus, Star, Trash2 } from 'lucide-react';
import type { Reference } from '@/core/types';

interface ReferencesTabSectionsProps {
  references: Reference[];
  onEdit: (ref: Reference) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onToggleActive: (ref: Reference) => Promise<void>;
}

export default function ReferencesTabSections({ references, onEdit, onDelete, onCreate, onToggleActive }: ReferencesTabSectionsProps) {
  const [togglingId, setTogglingId] = useState<string | number | null>(null);

  const handleToggle = async (item: Reference) => {
    if (togglingId === item.id) return;
    setTogglingId(item.id as string | number);
    try {
      await onToggleActive(item);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onCreate} className="admin-btn admin-btn-primary">
          <Plus size={16} /> Yeni Referans Ekle
        </button>
      </div>

      <div className="admin-card-grid">
        {references.map((item) => (
          <article key={item.id} className={`admin-entity-card${item.active === false ? ' admin-entity-card--inactive' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.logoPath ? (
                    <img src={item.logoPath} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Star size={22} style={{ color: '#94a3b8' }} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(22,163,74,0.1)', color: '#16a34a', marginTop: 4 }}>
                    {item.sector}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => onEdit(item)} className="admin-btn admin-btn-sm" title="Düzenle">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(String(item.id))} className="admin-btn admin-btn-sm admin-btn-danger" title="Sil">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '10px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {(item.description || '').substring(0, 80)}
              {(item.description || '').length > 80 ? '...' : ''}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => handleToggle(item)}
                disabled={togglingId === item.id}
                className="admin-btn admin-btn-sm"
                style={{ color: item.active === false ? '#dc2626' : '#16a34a', borderColor: item.active === false ? '#fecaca' : '#bbf7d0' }}
              >
                {item.active === false ? 'Pasif' : 'Aktif'}
              </button>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {item.id}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
