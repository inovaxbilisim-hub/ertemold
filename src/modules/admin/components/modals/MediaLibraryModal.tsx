'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
  url: string;
  name: string;
  size: number;
  date: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'kutuphane' | 'yukle'>('kutuphane');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (res.ok) {
        setFiles(data.data?.files || []);
        if (data.data?.warning) {
          toast.info(data.data.warning, { duration: 6000 });
        }
      } else {
        toast.error(data.error || 'Medya listesi yüklenemedi.');
      }
    } catch {
      toast.error('Bağlantı hatası: Medya sunucusuna erişilemiyor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'kutuphane') {
      fetchMedia();
    }
  }, [isOpen, activeTab]);

  const handleDelete = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (!confirm('Bu görseli kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        toast.success('Görsel başarıyla silindi.');
        if (selectedUrl === url) setSelectedUrl(null);
        fetchMedia();
      } else {
        toast.error('Hata: Silinemedi');
      }
    } catch {
      toast.error('Görsel silinirken bir hata oluştu.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Yükleme başarısız');
      const data = await res.json();
      const url = data.data?.url || data?.url;
      if (url) {
        onSelect(url);
        onClose();
        toast.success('Görsel başarıyla yüklendi.');
      } else {
        throw new Error('URL yanıtta bulunamadı');
      }
    } catch (error: any) {
      toast.error(error.message || 'Görsel yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose} style={{ zIndex: 999999 }}>
      <div
        className="admin-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 900, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="admin-modal-header">
          <h2>Medya Kütüphanesi</h2>
          <button onClick={onClose} className="admin-btn admin-btn-sm">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          <button
            onClick={() => setActiveTab('kutuphane')}
            className="admin-tab-btn"
            style={{
              flex: 1, padding: '14px 16px', fontWeight: 600, justifyContent: 'center', borderRadius: 0,
              background: activeTab === 'kutuphane' ? 'var(--bg-primary)' : 'transparent',
              borderBottom: activeTab === 'kutuphane' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'kutuphane' ? 'var(--color-primary)' : 'var(--text-muted)',
            }}
          >
            Kütüphaneden Seç
          </button>
          <button
            onClick={() => setActiveTab('yukle')}
            className="admin-tab-btn"
            style={{
              flex: 1, padding: '14px 16px', fontWeight: 600, justifyContent: 'center', borderRadius: 0,
              background: activeTab === 'yukle' ? 'var(--bg-primary)' : 'transparent',
              borderBottom: activeTab === 'yukle' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'yukle' ? 'var(--color-primary)' : 'var(--text-muted)',
            }}
          >
            Yeni Görsel Yükle
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--bg-secondary)' }}>
          {activeTab === 'kutuphane' ? (
            loading ? (
              <div className="admin-loading">
                <Loader2 size={24} style={{ animation: 'admin-spin 0.8s linear infinite' }} />
                Yükleniyor...
              </div>
            ) : files.length === 0 ? (
              <div className="admin-empty">
                <ImageIcon size={48} />
                <p>Henüz yüklenmiş medya bulunmuyor.</p>
                <button onClick={() => setActiveTab('yukle')} className="admin-btn admin-btn-primary" style={{ marginTop: 12 }}>
                  <Upload size={14} /> Görsel Yükle
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {files.map((file) => (
                  <div
                    key={file.url}
                    onClick={() => setSelectedUrl(file.url)}
                    style={{
                      position: 'relative',
                      borderRadius: 12,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: 'var(--bg-primary)',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: selectedUrl === file.url ? '3px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img src={file.url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={(e) => handleDelete(e, file.url)}
                      className="admin-btn admin-btn-sm admin-btn-danger"
                      style={{ position: 'absolute', top: 6, left: 6, padding: '6px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                    {selectedUrl === file.url && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 8px', fontSize: '0.6rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {formatSize(file.size)}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="admin-btn admin-btn-dashed"
                style={{ maxWidth: 500, width: '100%', padding: '60px 40px', cursor: uploading ? 'default' : 'pointer' }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={48} style={{ animation: 'admin-spin 0.8s linear infinite', color: 'var(--color-primary)' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 12 }}>Yükleniyor...</p>
                  </>
                ) : (
                  <>
                    <Upload size={48} style={{ color: 'var(--text-muted)' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 12, fontSize: '1rem' }}>Görsel Seçmek İçin Tıklayın</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Maksimum 10MB (JPEG, PNG, WEBP)</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'kutuphane' && (
          <div className="admin-modal-footer">
            <button className="admin-btn" onClick={onClose}>İptal</button>
            <button
              onClick={() => { if (selectedUrl) { onSelect(selectedUrl); onClose(); } }}
              disabled={!selectedUrl}
              className="admin-btn-primary admin-btn"
              style={{ opacity: selectedUrl ? 1 : 0.5 }}
            >
              <Check size={16} /> Seçimi Onayla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
