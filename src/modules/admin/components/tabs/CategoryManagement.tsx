'use client';

import React from 'react';
import { Plus, Edit2, Trash2, Layers, Shield, Monitor, Network, Box } from 'lucide-react';
import type { ServiceCategory } from '@/core/types';

interface CategoryManagementProps {
  categories: ServiceCategory[];
  saving: boolean;
  onEdit: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Monitor,
  Network,
  Layers,
  Box
};

export default function CategoryManagement({ categories, onEdit, onDelete, onCreate }: CategoryManagementProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onCreate} className="admin-btn admin-btn-primary">
          <Plus size={16} /> Yeni Kategori Ekle
        </button>
      </div>

      <div className="admin-card-grid">
        {categories.map((category) => {
          const Icon = ICON_MAP[category.icon] || Box;
          return (
            <article key={category.id} className="admin-entity-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color="#fff" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{category.name}</h3>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: '#6366f1', marginTop: 4 }}>
                      ID: {category.id}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => onEdit(category)} className="admin-btn admin-btn-sm" title="Düzenle">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(String(category.id))} className="admin-btn admin-btn-sm admin-btn-danger" title="Sil">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '10px 0 0', lineHeight: 1.5 }}>
                {category.description || 'Açıklama belirtilmemiş.'}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
