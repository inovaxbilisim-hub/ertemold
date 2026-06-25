'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Save, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEntities } from '@/app/admin/hooks/useEntities';
import { toast } from 'sonner';
import { createTranslator } from '@/i18n';
import type { Locale } from '@/i18n';

export interface Column {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'image' | 'icon' | 'select' | 'color' | 'wysiwyg';
  required?: boolean;
  options?: { value: string; label: string }[];
  full?: boolean;
}

interface GenericEntityPageProps {
  entityType: string;
  title: string;
  columns: Column[];
  formFields: FormField[];
  searchFields?: string[];
  locale?: Locale;
}

export default function GenericEntityPage({
  entityType,
  title,
  columns,
  formFields,
  searchFields = ['title'],
  locale = 'tr',
}: GenericEntityPageProps) {
  const { data, loading, create, update, remove } = useEntities<any>(entityType);
  const t = createTranslator(locale);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = data.filter((item: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return searchFields.some(f => String(item[f] || '').toLowerCase().includes(q));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSave = async () => {
    const required = formFields.filter(f => f.required);
    const missing = required.find(f => !editing?.[f.key]);
    if (missing) { toast.error(`${missing.label} zorunlu`); return; }
    setSaving(true);
    try {
      const payload = { ...editing };
      if (editing.id) await update(editing.id, payload);
      else await create(payload);
      toast.success(t('common.success', 'Kaydedildi'));
      setModalOpen(false); setEditing(null);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.delete', 'Silmek istediğinize emin misiniz?'))) return;
    try { await remove(id); toast.success(t('common.success', 'Silindi')); } catch (e: any) { toast.error(e.message); }
  };

  const handleFieldImage = async (key: string, val: string) => {
    setEditing((prev: any) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{title}</h1>
          <span className="admin-badge">{data.length} {t('common.noData', 'kayıt')}</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="admin-input" placeholder={t('common.search', 'Ara...')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 36, width: 240 }} />
          </div>
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditing({}); setModalOpen(true); }}>
            <Plus size={14} /> {t('common.create', 'Yeni')}
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading"><Loader2 size={20} style={{ animation: 'admin-spin 0.8s linear infinite' }} /> {t('common.loading', 'Yükleniyor...')}</div>
        ) : paged.length === 0 ? (
          <div className="admin-empty">
            <Search size={32} />
            <p>{t('common.noData', 'Kayıt bulunamadı.')}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map(c => <th key={c.key}>{c.label}</th>)}
                <th style={{ textAlign: 'right', width: 100 }}>{t('common.edit', 'İşlem')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((item: any) => (
                <tr key={item.id}>
                  {columns.map(c => (
                    <td key={c.key}>
                      {c.render ? c.render(item) : (item[c.key] ?? '—')}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="admin-btn admin-btn-sm" onClick={() => { setEditing(item); setModalOpen(true); }} title={t('common.edit', 'Düzenle')}>
                      <Edit size={14} />
                    </button>
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(item.id)} style={{ marginLeft: 4 }} title={t('common.delete', 'Sil')}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
          <button className="admin-btn admin-btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={14} /> {t('common.search', 'Önceki')}
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('common.search', 'Sayfa')} {page} / {totalPages}
          </span>
          <button className="admin-btn admin-btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            {t('common.search', 'Sonraki')} <ChevronRight size={14} />
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => { setModalOpen(false); setEditing(null); }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="admin-modal-header">
              <h2>{editing?.id ? t('common.edit', 'Düzenle') : t('common.create', 'Yeni')} {title}</h2>
              <button className="admin-btn admin-btn-sm" onClick={() => { setModalOpen(false); setEditing(null); }}>
                <X size={14} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                {formFields.map(f => (
                  <div key={f.key} className={`admin-form-field ${f.full ? 'admin-form-field-full' : 'admin-form-field-half'}`}>
                    <label className="admin-label">{f.label}{f.required ? ' *' : ''}</label>
                    {f.type === 'text' && (
                      <input className="admin-input" value={editing?.[f.key] || ''} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} />
                    )}
                    {f.type === 'number' && (
                      <input className="admin-input" type="number" value={editing?.[f.key] ?? 0} onChange={e => setEditing({ ...editing, [f.key]: Number(e.target.value) })} />
                    )}
                    {f.type === 'boolean' && (
                      <select className="admin-select" value={editing?.[f.key] === false ? '0' : '1'} onChange={e => setEditing({ ...editing, [f.key]: e.target.value === '1' })}>
                        <option value="1">Aktif</option>
                        <option value="0">Pasif</option>
                      </select>
                    )}
                    {f.type === 'select' && (
                      <select className="admin-select" value={editing?.[f.key] || ''} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })}>
                        <option value="">Seçiniz</option>
                        {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    )}
                    {f.type === 'textarea' && (
                      <textarea className="admin-textarea" rows={4} value={editing?.[f.key] || ''} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} />
                    )}
                    {f.type === 'wysiwyg' && (
                      <textarea className="admin-textarea" rows={8} value={editing?.[f.key] || ''} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} />
                    )}
                    {f.type === 'image' && (
                      <ImageField value={editing?.[f.key] || ''} onChange={v => handleFieldImage(f.key, v)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => { setModalOpen(false); setEditing(null); }}>{t('common.cancel', 'İptal')}</button>
              <button className="admin-btn-primary admin-btn" onClick={handleSave} disabled={saving}>
                <Save size={14} /> {saving ? t('common.loading', 'Kaydediliyor...') : t('common.save', 'Kaydet')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [ImagePicker, setImagePicker] = useState<any>(null);
  useEffect(() => {
    import('@/modules/admin/components/AdminImagePicker').then(m => setImagePicker(() => m.default));
  }, []);
  if (!ImagePicker) return <input className="admin-input" value={value} onChange={e => onChange(e.target.value)} placeholder="Görsel URL" />;
  return <ImagePicker value={value} onChange={onChange} />;
}