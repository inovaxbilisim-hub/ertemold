'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Loader2, Save, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEntities } from '@/app/admin/hooks/useEntities';
import AdminImagePicker from '@/modules/admin/components/AdminImagePicker';
import { toast } from 'sonner';

interface ProjectItem {
  id?: number; slug?: string; title?: string; client?: string; sector?: string;
  location?: string; description?: string; imagePath?: string; gallery?: string[];
  year?: number; status?: string; active?: boolean; sort_order?: number; featured?: boolean;
}

export default function ProjectsPage() {
  const { data: projects, loading, create, update, remove } = useEntities<ProjectItem>('project');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = projects.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.client?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSave = async () => {
    if (!editing?.title) { toast.error('Başlık zorunlu'); return; }
    setSaving(true);
    try {
      if (editing.id) await update(editing.id, { ...editing });
      else await create({ ...editing });
      toast.success('Kaydedildi');
      setModalOpen(false); setEditing(null);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sil?')) return;
    try { await remove(id); toast.success('Silindi'); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Projeler</h1><span className="admin-badge">{projects.length} kayıt</span></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="admin-input" placeholder="Ara..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 36, width: 240 }} />
          </div>
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditing({}); setModalOpen(true); }}>
            <Plus size={14} /> Yeni Proje
          </button>
        </div>
      </div>
      {loading ? <div className="admin-loading"><Loader2 className="animate-spin" /> Yükleniyor...</div> : (
        <table className="admin-table">
          <thead><tr><th>Görsel</th><th>Başlık</th><th>Müşteri</th><th>Sektör</th><th>Yıl</th><th>Durum</th><th style={{ textAlign: 'right' }}>İşlem</th></tr></thead>
          <tbody>
            {paged.map(p => (
              <tr key={p.id}>
                <td>{p.imagePath ? <img src={p.imagePath} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 48, height: 48, background: 'var(--bg-tertiary)', borderRadius: 8 }} />}</td>
                <td><strong>{p.title}</strong></td>
                <td>{p.client || '—'}</td>
                <td>{p.sector || '—'}</td>
                <td>{p.year || '—'}</td>
                <td>{p.active !== false ? <span className="badge badge-success">Aktif</span> : <span className="badge">Pasif</span>}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="admin-btn admin-btn-sm" onClick={() => { setEditing(p); setModalOpen(true); }}><Edit size={14} /></button>
                  <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(p.id!)} style={{ marginLeft: 4 }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button className="admin-btn admin-btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /> Önceki</button>
          <span style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>Sayfa {page} / {totalPages}</span>
          <button className="admin-btn admin-btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sonraki <ChevronRight size={14} /></button>
        </div>
      )}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => { setModalOpen(false); setEditing(null); }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="admin-modal-header">
              <h2>{editing?.id ? 'Proje Düzenle' : 'Yeni Proje'}</h2>
              <button className="admin-btn admin-btn-sm" onClick={() => { setModalOpen(false); setEditing(null); }}><X size={14} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-label">Başlık *</label>
                  <input className="admin-input" value={editing?.title || ''} onChange={e => setEditing({ ...editing!, title: e.target.value })} />
                </div>
                <div className="admin-form-field admin-form-field-half">
                  <label className="admin-label">Müşteri</label>
                  <input className="admin-input" value={editing?.client || ''} onChange={e => setEditing({ ...editing!, client: e.target.value })} />
                </div>
                <div className="admin-form-field admin-form-field-half">
                  <label className="admin-label">Sektör</label>
                  <input className="admin-input" value={editing?.sector || ''} onChange={e => setEditing({ ...editing!, sector: e.target.value })} />
                </div>
                <div className="admin-form-field admin-form-field-half">
                  <label className="admin-label">Konum</label>
                  <input className="admin-input" value={editing?.location || ''} onChange={e => setEditing({ ...editing!, location: e.target.value })} />
                </div>
                <div className="admin-form-field admin-form-field-half">
                  <label className="admin-label">Yıl</label>
                  <input className="admin-input" type="number" value={editing?.year || ''} onChange={e => setEditing({ ...editing!, year: Number(e.target.value) })} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-label">Görsel</label>
                  <AdminImagePicker value={editing?.imagePath || ''} onChange={(v: string) => setEditing({ ...editing!, imagePath: v })} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-textarea" rows={4} value={editing?.description || ''} onChange={e => setEditing({ ...editing!, description: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => { setModalOpen(false); setEditing(null); }}>İptal</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}><Save size={14} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
