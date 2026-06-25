'use client';

import { Briefcase, Bot, Edit2, Layers, Plus, Trash2 } from 'lucide-react';
import type { Service, ServiceCategory } from '@/core/types';

interface ServicesTabSectionsProps {
  services: Service[];
  categories: ServiceCategory[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onManageCategories: () => void;
  onOpenAIPrompts: () => void;
}

export default function ServicesTabSections({ services, categories, onEdit, onDelete, onCreate, onManageCategories, onOpenAIPrompts }: ServicesTabSectionsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onCreate} className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Yeni Hizmet Ekle</span>
          </button>
          <button onClick={onManageCategories} className="admin-btn admin-btn-outline">
            <Layers size={16} />
            <span>Kategorileri Yönet</span>
          </button>
          <button onClick={onOpenAIPrompts} className="admin-btn admin-btn-outline">
            <Bot size={16} />
            <span>AI Promptları</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Toplam Hizmet:</span>
          <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{services.length}</strong>
        </div>
      </div>

      <div className="admin-card-grid">
        {services.map((service) => {
          const categoryName = categories.find(c => c.id === service.category_id)?.name || 'Kategorisiz';
          return (
            <article key={service.id} className="admin-entity-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {service.imagePath ? (
                      <img src={service.imagePath} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Briefcase size={20} style={{ color: '#94a3b8' }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{service.title}</h3>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(37,99,235,0.1)', color: '#2563eb', marginTop: 4 }}>
                      {categoryName}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => onEdit(service)} className="admin-btn admin-btn-sm" title="Düzenle">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(String(service.id))} className="admin-btn admin-btn-sm admin-btn-danger" title="Sil">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '10px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {(service.description || '').substring(0, 80)}
                {(service.description || '').length > 80 ? '...' : ''}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 600, background: service.active ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)', color: service.active ? '#16a34a' : '#dc2626' }}>
                  {service.active ? 'Aktif' : 'Pasif'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {service.id}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
