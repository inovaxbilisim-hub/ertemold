'use client';

import React from 'react';
import { X, Save } from 'lucide-react';

interface ItemEditorModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}

export default function ItemEditorModal({ title, isOpen, onClose, onSave, saving, children }: ItemEditorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 860 }}>
        <div className="admin-modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="admin-btn admin-btn-sm">
            <X size={16} />
          </button>
        </div>

        <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>

        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={onClose}>İptal</button>
          <button className="admin-btn admin-btn-primary" onClick={onSave} disabled={saving}>
            <Save size={16} />
            {saving ? 'Kaydediliyor...' : 'Kaydet ve Kapat'}
          </button>
        </div>
      </div>
    </div>
  );
}
