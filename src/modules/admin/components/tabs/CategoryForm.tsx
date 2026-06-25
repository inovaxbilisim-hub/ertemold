'use client';

import { useState } from 'react';
import { Box, Plus, Trash2, List, Sparkles, Loader2 } from 'lucide-react';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import type { ServiceCategory } from '@/core/types';

interface CategoryFormProps {
  item: Partial<ServiceCategory>;
  onUpdate: (item: Partial<ServiceCategory>) => void;
}

export default function CategoryForm({ item, onUpdate }: CategoryFormProps) {
  const { settings } = useSettings();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!item.name) {
      alert('Lütfen önce bir kategori adı girin.');
      return;
    }

    setIsGenerating(true);
    try {
      const promptFields = settings?.ai_prompt_category_fields || ['description', 'features'];
      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.name, type: 'category', fields: promptFields })
      });
      
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'API Hatası');

      if (responseData.success && responseData.data) {
        const ai = responseData.data;
        onUpdate({
          ...item,
          description: ai.description || item.description || "",
          features: (Array.isArray(ai.features) && ai.features.length > 0) ? ai.features : (item.features || []),
        });
      }
    } catch (err: any) {
      alert(`Yapay zeka hatası: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleFeatureAdd = () => {
    const features = [...(item.features || []), ''];
    onUpdate({ ...item, features });
  };

  const handleFeatureChange = (index: number, val: string) => {
    const features = [...(item.features || [])];
    features[index] = val;
    onUpdate({ ...item, features });
  };

  const handleFeatureRemove = (index: number) => {
    const features = (item.features || []).filter((_, i) => i !== index);
    onUpdate({ ...item, features });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Basic Info */}
      <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="admin-form-group">
          <label className="admin-label">Kategori Adı</label>
          <input 
            type="text" 
            className="admin-input" 
            value={item.name || ''} 
            onChange={e => onUpdate({ ...item, name: e.target.value })} 
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Slug (URL)</label>
          <input 
            type="text" 
            className="admin-input" 
            value={item.slug || ''} 
            onChange={e => onUpdate({ ...item, slug: e.target.value })} 
          />
        </div>
      </div>

      <div className="admin-form-group">
        <label className="admin-label">İkon (Lucide Name)</label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="text" 
            className="admin-input" 
            value={item.icon || 'Box'} 
            onChange={e => onUpdate({ ...item, icon: e.target.value })} 
          />
          <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
            <Box size={20} />
          </div>
        </div>
      </div>

      <div className="admin-form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="admin-label" style={{ marginBottom: 0 }}>Açıklama</label>
          <button 
            type="button"
            onClick={handleAiGenerate}
            disabled={isGenerating || !item.name}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 14px', 
              fontSize: '12px', 
              fontWeight: '600',
              borderRadius: '20px',
              cursor: item.name ? 'pointer' : 'not-allowed',
              background: isGenerating ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            <span>{isGenerating ? 'Üretiliyor...' : 'AI ile Doldur'}</span>
          </button>
        </div>
        <textarea 
          className="admin-textarea" 
          value={item.description || ''} 
          onChange={e => onUpdate({ ...item, description: e.target.value })} 
          rows={4}
        />
      </div>

      {/* Features Section */}
      <div style={{ padding: '24px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={20} className="text-accent" />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Kategori Özellikleri</h4>
          </div>
          <button onClick={handleFeatureAdd} className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
            <Plus size={16} />
            Ekle
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(Array.isArray(item.features) ? item.features : []).map((feature, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="admin-input" 
                value={feature} 
                onChange={e => handleFeatureChange(idx, e.target.value)}
                placeholder="Örn: 7/24 Teknik Destek"
              />
              <button onClick={() => handleFeatureRemove(idx)} className="admin-btn-outline" style={{ padding: '8px', color: 'var(--error)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(item.features || []).length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', margin: '10px 0' }}>Henüz özellik eklenmemiş.</p>
          )}
        </div>
      </div>

      <div className="admin-form-group">
        <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={item.active ?? true} 
            onChange={e => onUpdate({ ...item, active: e.target.checked })} 
          />
          <span>Aktif / Yayınla</span>
        </label>
      </div>
    </div>
  );
}
