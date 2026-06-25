'use client';

import { Edit2, Globe, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import type { Branch } from '@/core/types';

interface BranchManagementProps {
  branches: Branch[];
  activeBranchCity: string;
  searchQuery: string;
  saving: boolean;
  onCityChange: (city: string) => void;
  onSearchQueryChange: (query: string) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const ALL_CITIES = 'all';

export default function BranchManagement({
  branches,
  activeBranchCity,
  searchQuery,
  saving: _saving,
  onCityChange,
  onSearchQueryChange,
  onEdit,
  onDelete,
  onCreate,
}: BranchManagementProps) {
  void _saving;

  const filteredBranches = branches.filter((branch) => {
    const cityMatch = activeBranchCity === ALL_CITIES || branch.city_name === activeBranchCity;
    const searchMatch =
      !searchQuery ||
      branch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (branch.city_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return cityMatch && searchMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select className="admin-select" value={activeBranchCity} onChange={(event) => onCityChange(event.target.value)} style={{ minWidth: '150px' }}>
            <option value={ALL_CITIES}>Tum Sehirler</option>
            {Array.from(new Set(branches.map((branch) => branch.city_name).filter(Boolean)))
              .sort()
              .map((city) => (
                <option key={city} value={city as string}>
                  {city}
                </option>
              ))}
          </select>
          <input
            type="text"
            className="admin-input"
            placeholder="Şube veya adres ara..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            style={{ minWidth: '250px' }}
          />
        </div>
        <button onClick={onCreate} className="admin-btn admin-btn-primary">
          <Plus size={16} /> Yeni Sube Ekle
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredBranches.map((branch) => (
          <div key={branch.id} className="admin-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={`badge ${branch.type === 'merkez' ? 'badge-blue' : 'badge-green'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                  {branch.type === 'merkez' ? 'Merkez' : 'Sube'}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{branch.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {branch.city_name}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => onEdit(branch)} className="admin-btn admin-btn-sm" title="Düzenle">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(branch.id)} className="admin-btn admin-btn-sm admin-btn-danger" title="Sil">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Phone size={14} /> {branch.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Globe size={14} /> {branch.city_slug}
              </div>
              <div style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {(branch.address || '').substring(0, 100)}
                {(branch.address || '').length > 100 ? '...' : ''}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: branch.active ? '#00d4aa' : '#ef4444', fontWeight: 600 }}>{branch.active ? 'Aktif' : 'Pasif'}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sira: {branch.sort_order}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredBranches.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '60px' }}>
          <MapPin size={48} color="var(--border-strong)" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Aranan kriterlere uygun sube bulunamadi.</p>
        </div>
      ) : null}
    </div>
  );
}
