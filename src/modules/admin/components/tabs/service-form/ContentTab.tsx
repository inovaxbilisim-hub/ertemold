'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Service } from '@/core/types';

interface ContentTabProps {
  item: Partial<Service>;
  isGenerating: boolean;
  onUpdate: (item: Partial<Service>) => void;
  onAiGenerate: () => void;
}

export default function ContentTab({ item, isGenerating, onUpdate, onAiGenerate }: ContentTabProps) {
  const addFeature = () => {
    onUpdate({ ...item, features: [...(item.features || []), ''] });
  };

  const removeFeature = (index: number) => {
    onUpdate({ ...item, features: (item.features || []).filter((_, i) => i !== index) });
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...(item.features || [])];
    features[index] = value;
    onUpdate({ ...item, features });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Kısa Açıklama */}
      <div className="admin-form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="admin-label" style={{ marginBottom: 0 }}>Kısa Açıklama (Kart Görünümü)</label>
          <button
            type="button"
            onClick={onAiGenerate}
            disabled={isGenerating || !item.title}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '6px',
              border: 'none',
              background: isGenerating ? '#e2e8f0' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: isGenerating ? '#94a3b8' : 'white',
              cursor: (isGenerating || !item.title) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            ✨ {isGenerating ? 'Üretiliyor...' : 'AI ile Doldur'}
          </button>
        </div>
        <textarea
          className="admin-textarea"
          value={item.description || ''}
          onChange={e => onUpdate({ ...item, description: e.target.value })}
          rows={2}
          placeholder="Hizmet kartında görünecek kısa açıklama..."
        />
      </div>

      {/* Uzun Açıklama */}
      <div className="admin-form-group">
        <label className="admin-label">Detaylı Açıklama (Hizmet Sayfası)</label>
        <textarea
          className="admin-textarea"
          value={item.longDescription || ''}
          onChange={e => onUpdate({ ...item, longDescription: e.target.value })}
          rows={6}
          placeholder="Hizmet detay sayfasında gösterilecek tam açıklama..."
        />
      </div>

      {/* Özellikler */}
      <div className="admin-form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label className="admin-label" style={{ marginBottom: 0 }}>Hizmet Özellikleri</label>
          <button
            type="button"
            onClick={addFeature}
            className="admin-btn admin-btn-sm"
          >
            <Plus size={14} /> Yeni Ekle
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(item.features || []).map((feature, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="admin-input"
                value={feature}
                onChange={e => updateFeature(idx, e.target.value)}
                placeholder={`Özellik ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => removeFeature(idx)}
                style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(item.features || []).length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '10px' }}>
              Henüz özellik eklenmedi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
