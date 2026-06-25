'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Section {
  sectionKey: string;
  badge: string;
  title: string;
  subtitle: string;
  content: string;
}

interface SectionManagementProps {
  sections: Section[];
  saving: boolean;
  onUpdate: (data: any[]) => void;
  onSave: () => void;
}

export default function SectionManagement({ sections, saving, onUpdate, onSave }: SectionManagementProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Section | null>(null);

  const handleEdit = (section: Section) => {
    setEditingKey(section.sectionKey);
    setEditValues({ ...section });
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValues(null);
  };

  const handleChange = (field: keyof Section, value: string) => {
    if (editValues) {
      setEditValues({ ...editValues, [field]: value });
    }
  };

  const handleUpdate = () => {
    if (!editValues) return;
    
    const updatedSections = sections.map(s => 
      s.sectionKey === editValues.sectionKey ? editValues : s
    );
    
    onUpdate(updatedSections);
    setEditingKey(null);
    setEditValues(null);
    toast.success('Bölüm içeriği güncellendi, kaydetmeyi unutmayın.');
  };

  return (
    <div className="admin-card">
      <div className="admin-toolbar">
        <h3 className="text-lg font-bold">Bölüm İçerikleri</h3>
        <button onClick={onSave} className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Bölüm Anahtarı</th>
              <th>Rozet (Badge)</th>
              <th>Başlık</th>
              <th>Alt Başlık</th>
              <th>İçerik</th>
              <th style={{ textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.sectionKey}>
                <td>
                  <code style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '4px' }}>
                    {section.sectionKey}
                  </code>
                </td>
                <td>
                  {editingKey === section.sectionKey ? (
                    <input
                      type="text"
                      className="admin-input"
                      value={editValues?.badge || ''}
                      onChange={(e) => handleChange('badge', e.target.value)}
                    />
                  ) : (
                    section.badge
                  )}
                </td>
                <td>
                  {editingKey === section.sectionKey ? (
                    <input
                      type="text"
                      className="admin-input"
                      value={editValues?.title || ''}
                      onChange={(e) => handleChange('title', e.target.value)}
                    />
                  ) : (
                    section.title
                  )}
                </td>
                <td>
                  {editingKey === section.sectionKey ? (
                    <textarea
                      className="admin-input"
                      style={{ minHeight: '60px' }}
                      value={editValues?.subtitle || ''}
                      onChange={(e) => handleChange('subtitle', e.target.value)}
                    />
                  ) : (
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {section.subtitle}
                    </div>
                  )}
                </td>
                <td>
                  {editingKey === section.sectionKey ? (
                    <textarea
                      className="admin-input"
                      style={{ minHeight: '80px', width: '100%' }}
                      value={editValues?.content || ''}
                      onChange={(e) => handleChange('content', e.target.value)}
                    />
                  ) : (
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {section.content}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {editingKey === section.sectionKey ? (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={handleUpdate} className="admin-btn admin-btn-sm" style={{ background: 'var(--admin-primary)', color: '#fff' }}>
                        Tamam
                      </button>
                      <button onClick={handleCancel} className="admin-btn admin-btn-sm" style={{ background: '#e2e8f0', color: '#475569' }}>
                        İptal
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(section)} className="admin-btn admin-btn-sm">
                      Düzenle
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
