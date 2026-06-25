'use client';

import { useState } from 'react';
import { X, ImageIcon } from 'lucide-react';
import MediaLibraryModal from './modals/MediaLibraryModal';
import { cloudinaryAutoFormat } from '@/shared/lib/cloudinary';

import { useSettings } from '@/modules/settings/context/SettingsContext';

interface AdminImagePickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function AdminImagePicker({ value, onChange, label }: AdminImagePickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { settings } = useSettings();
  const cloudName = settings?.cloudinary_cloud_name || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const previewSrc = value ? cloudinaryAutoFormat(value, cloudName) : undefined;

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      {previewSrc ? (
        <div style={{ position: 'relative' }}>
          <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
            <img 
              src={previewSrc} 
              alt="" 
              onError={(e) => { 
                e.currentTarget.style.opacity = '0';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted);flex-direction:column;gap:4px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span style="font-size:10px">404</span></div>';
                }
              }} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <button 
            type="button"
            onClick={() => onChange('')} 
            title="Kaldır"
            style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '50%', padding: '2px', cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div style={{ width: '80px', height: '60px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
          <ImageIcon size={24} />
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
        {value && (
          <p
            title={value}
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {value.split('/').pop()?.split('?')[0] || value}
          </p>
        )}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="admin-btn"
          style={{ fontSize: '13px' }}
        >
          <ImageIcon size={16} /> {label || 'Görsel Seç / Yükle'}
        </button>
      </div>

      <MediaLibraryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSelect={(url) => {
          onChange(url);
          setModalOpen(false);
        }} 
      />
    </div>
  );
}
