'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface StatItem {
  id?: number | string;
  label: string;
  value: string;
  suffix?: string;
  sort_order?: number;
  active?: boolean;
}

const API = '/api/admin/stats';

export default function StatsAdminPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<StatItem>({ label: '', value: '', suffix: '', active: true });
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { cache: 'no-store' });
      const json = await res.json();
      setStats((json.data || json) as StatItem[]);
    } catch {
      toast.error('Yüklenemedi');
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!editForm.label || !editForm.value) {
      toast.error('Etiket ve Değer zorunludur');
      return;
    }
    setSaving(true);

    let updated: StatItem[];
    if (isNew) {
      // Yeni kayıt: geçici ID ile ekle, sunucuya mevcut+yeni liste gönder
      const tempItem: StatItem = {
        ...editForm,
        id: Date.now(), // geçici, sunucu yeni id atar
        sort_order: stats.length,
      };
      updated = [...stats, tempItem];
    } else {
      updated = stats.map(s => s.id === editingId ? { ...s, ...editForm } : s);
    }

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Sunucu hatası');
      toast.success('Kaydedildi');
      setEditingId(null);
      setIsNew(false);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const remove = async (id: number | string | undefined) => {
    if (!id || !confirm('Silmek istediğinize emin misiniz?')) return;
    setSaving(true);
    const updated = stats.filter(s => s.id !== id);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Silme başarısız');
      toast.success('Silindi');
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const startEdit = (stat: StatItem) => {
    setEditingId(stat.id ?? null);
    setEditForm({ label: stat.label, value: stat.value, suffix: stat.suffix || '', active: stat.active !== false, sort_order: stat.sort_order });
    setIsNew(false);
  };

  const startNew = () => {
    setEditingId('__new__');
    setEditForm({ label: '', value: '', suffix: '', active: true, sort_order: stats.length });
    setIsNew(true);
  };

  const cancel = () => { setEditingId(null); setIsNew(false); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Site Sayaçları</h1>
          <span className="admin-badge">{stats.length} kayıt</span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={startNew} disabled={saving}>
          <Plus size={14} /> Yeni Sayaç
        </button>
      </div>

      {/* Yeni / Düzenleme Formu */}
      {editingId !== null && (
        <div className="admin-card" style={{ marginBottom: 24, border: '1px solid var(--accent-teal)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
            <BarChart3 size={16} /> {isNew ? 'Yeni Sayaç Ekle' : 'Düzenle'}
          </h3>
          <div className="admin-form-grid">
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">Değer *</label>
              <input
                className="admin-input"
                value={editForm.value}
                onChange={e => setEditForm(f => ({ ...f, value: e.target.value }))}
                placeholder="500+"
              />
            </div>
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">Sonek</label>
              <input
                className="admin-input"
                value={editForm.suffix || ''}
                onChange={e => setEditForm(f => ({ ...f, suffix: e.target.value }))}
                placeholder="+, %, /7 vb."
              />
            </div>
            <div className="admin-form-field admin-form-field-full">
              <label className="admin-label">Etiket *</label>
              <input
                className="admin-input"
                value={editForm.label}
                onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                placeholder="Tamamlanan Proje"
              />
            </div>
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">Sıra</label>
              <input
                className="admin-input"
                type="number"
                value={editForm.sort_order ?? 0}
                onChange={e => setEditForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
              />
            </div>
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">Durum</label>
              <select
                className="admin-select"
                value={editForm.active === false ? '0' : '1'}
                onChange={e => setEditForm(f => ({ ...f, active: e.target.value === '1' }))}
              >
                <option value="1">Aktif</option>
                <option value="0">Pasif</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="admin-btn" onClick={cancel}>
              <X size={14} /> İptal
            </button>
            <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-loading"><Loader2 className="animate-spin" /> Yükleniyor...</div>
      ) : stats.length === 0 ? (
        <div className="admin-empty">Henüz sayaç eklenmemiş.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Değer</th>
              <th>Etiket</th>
              <th>Sıra</th>
              <th>Durum</th>
              <th style={{ textAlign: 'right' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(stat => (
              <tr key={stat.id}>
                <td><strong style={{ fontSize: 18 }}>{stat.value}{stat.suffix}</strong></td>
                <td>{stat.label}</td>
                <td>{stat.sort_order ?? 0}</td>
                <td>
                  {stat.active !== false
                    ? <span className="badge badge-success">Aktif</span>
                    : <span className="badge">Pasif</span>
                  }
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="admin-btn admin-btn-sm"
                    onClick={() => startEdit(stat)}
                    disabled={saving}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => remove(stat.id)}
                    disabled={saving}
                    style={{ marginLeft: 4 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
