'use client';

import { useState } from 'react';
import { 
  FileText, Plus, Copy, Trash2, Edit3, 
  ExternalLink, Search, Layers
} from 'lucide-react';
import { toast } from 'sonner';

import { Page } from '@/core/types';

interface PageManagementProps {
  pages: Page[];
  onRefresh: () => void;
  onEdit: (page: Page) => void;
}

const TEMPLATES = [
  { id: 'default', name: 'Standart (Yazı/Görsel)' },
  { id: 'home', name: 'Ana Sayfa Şablonu' },
  { id: 'about', name: 'Hakkımızda Şablonu' },
  { id: 'service', name: 'Hizmet / Ürün Detay' },
  { id: 'contact', name: 'İletişim Şablonu' }
];

export default function PageManagement({ pages, onRefresh, onEdit }: PageManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTemplate, setActiveTemplate] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [isCloning, setIsCloning] = useState<Page | null>(null);
  
  // New Page Form State
  const [formData, setFormData] = useState({ title: '', slug: '', template_name: 'default', is_published: true });

  const filteredPages = pages.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTemplate = activeTemplate === 'all' || p.template_name === activeTemplate;
    return matchesSearch && matchesTemplate;
  });

  const handleCreateOrClone = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = isCloning 
        ? { ...isCloning, id: `page_${Date.now()}`, title: `${isCloning.title} (Kopya)`, slug: formData.slug }
        : { ...formData, id: `page_${Date.now()}` };

      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isCloning ? "Sayfa başarıyla klonlandı!" : "Sayfa oluşturuldu!");
        setIsCreating(false);
        setIsCloning(null);
        setFormData({ title: '', slug: '', template_name: 'default', is_published: true });
        onRefresh();
      } else {
        const err = await res.json();
        toast.error("İşlem başarısız: " + (err.error || 'Bilinmeyen hata'));
      }
    } catch {
      toast.error("Bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sayfayı silmek istediğinize emin misiniz? Tüm içerik kaybolacak.')) return;

    try {
      const res = await fetch(`/api/admin/pages?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Sayfa silindi.");
        onRefresh();
      } else {
        toast.error("Silme işlemi başarısız.");
      }
    } catch {
      toast.error("Hata oluştu.");
    }
  };

  return (
    <div className="page-management">
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Sayfa adı veya link (slug) ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input" 
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select 
            className="admin-input" 
            style={{ width: '180px' }}
            value={activeTemplate}
            onChange={(e) => setActiveTemplate(e.target.value)}
          >
            <option value="all">Tüm Şablonlar</option>
            {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => {
              setIsCreating(true);
              setFormData({ title: '', slug: '/', template_name: 'default', is_published: true });
            }}
            className="admin-btn admin-btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Yeni Sayfa Ekle
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredPages.map((page, idx) => (
          <div key={page.id || page.slug || `page-${idx}`} className="admin-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: 'var(--accent-blue-10)', borderRadius: '12px', color: 'var(--accent-blue)' }}>
                <FileText size={24} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => {
                  setIsCloning(page);
                  setFormData({ title: `${page.title} (Kopya)`, slug: `${page.slug}-kopya`, template_name: page.template_name, is_published: false });
                }} className="icon-btn" title="Klonla"><Copy size={16} /></button>
                <button onClick={() => handleDelete(page.id)} className="icon-btn delete" title="Sil"><Trash2 size={16} /></button>
              </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{page.title}</h3>
            <code style={{ fontSize: '13px', color: 'var(--accent-teal)', display: 'block', marginBottom: '16px' }}>{page.slug}</code>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <span className={`badge badge-indigo`} style={{ fontSize: '11px' }}>
                {TEMPLATES.find(t => t.id === page.template_name)?.name || 'Bilinmeyen Şablon'}
              </span>
              <span className={`badge ${page.is_published ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '11px' }}>
                {page.is_published ? 'Yayında' : 'Taslak'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={() => onEdit(page)} className="admin-btn admin-btn-secondary" style={{ padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Edit3 size={14} /> İçeriği Düzenle
              </button>
              <a href={page.slug} target="_blank" rel="noreferrer" className="admin-btn admin-btn-secondary" style={{ padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                <ExternalLink size={14} /> Görüntüle
              </a>
            </div>
          </div>
        ))}

        {filteredPages.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', background: 'var(--bg-tertiary)', borderRadius: '20px', border: '2px dashed var(--border-subtle)' }}>
            <Layers size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Sayfa bulunamadı. Filtreleri değiştirmeyi veya yeni bir sayfa oluşturmayı deneyin.</p>
          </div>
        )}
      </div>

      {/* Create / Clone Modal Overlay */}
      {(isCreating || isCloning) && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px', padding: '40px', border: '1px solid var(--accent-blue-20)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', color: 'var(--text-primary)' }}>
              {isCloning ? 'Sayfayı Klonla' : 'Yeni Sayfa Oluştur'}
            </h2>
            
            <form onSubmit={handleCreateOrClone}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="admin-label">Sayfa Başlığı</label>
                <input 
                  required
                  type="text" 
                  className="admin-input" 
                  placeholder="Örn: Hakkımızda"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  disabled={isCloning !== null}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="admin-label">Slug / URL</label>
                <input 
                  required
                  type="text" 
                  className="admin-input" 
                  placeholder="Örn: /kurumsal/hakkimizda"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Boşluk kullanılamaz, otomatik tireye (-) çevrilir. Hiyerarşik olabilir: /kategori/sayfa-adi
                </small>
              </div>

              {!isCloning && (
                <div className="form-group" style={{ marginBottom: '32px' }}>
                  <label className="admin-label">Şablon (Template) Seçimi</label>
                  <select 
                    required
                    className="admin-input"
                    value={formData.template_name}
                    onChange={e => setFormData({ ...formData, template_name: e.target.value })}
                  >
                    {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <small style={{ color: 'var(--accent-teal)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Seçtiğiniz şablona göre tasarım formu otomatik oluşacaktır.
                  </small>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="admin-btn admin-btn-primary" style={{ flex: 1 }}>
                  {isCloning ? 'Klonlamayı Başlat' : 'Sayfa Oluştur'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsCreating(false); setIsCloning(null); }}
                  className="admin-btn admin-btn-secondary" 
                  style={{ flex: 1 }}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .icon-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-subtle);
          background: var(--bg-tertiary); color: var(--text-muted); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .icon-btn:hover { border-color: var(--accent-blue-40); color: var(--accent-blue); background: var(--accent-blue-10); }
        .icon-btn.delete:hover { border-color: #ef444440; color: #ef4444; background: #ef444410; }
        
        .badge { padding: 4px 10px; border-radius: 100px; font-weight: 700; text-transform: uppercase; }
        .badge-indigo { background: rgba(99,102,241,0.1); color: #818cf8; border: 1px solid rgba(99,102,241,0.2); }
        .badge-success { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
        .badge-warning { background: rgba(249,115,22,0.1); color: #fb923c; border: 1px solid rgba(249,115,22,0.2); }
      `}</style>
    </div>
  );
}
