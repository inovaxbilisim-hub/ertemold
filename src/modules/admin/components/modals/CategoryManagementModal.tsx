'use client';

import { X } from 'lucide-react';
import type { ServiceCategory } from '@/core/types';
import CategoryManagement from '../tabs/CategoryManagement';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ServiceCategory[];
  onEdit: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  saving: boolean;
}

export default function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  onEdit,
  onDelete,
  onCreate,
  saving,
}: CategoryManagementModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} 
      />
      
      <div className="admin-card" style={{ 
        position: 'relative', 
        zIndex: 999991, 
        width: '100%', 
        maxWidth: '1000px', 
        maxHeight: '90vh', 
        overflowY: 'auto',
        marginBottom: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Hizmet Kategorilerini Yönet</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          <CategoryManagement 
            categories={categories}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreate={onCreate}
            saving={saving}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={onClose} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
