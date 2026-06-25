'use client';

import { useAdminData } from '@/app/admin/hooks/useAdminData';
import { useAdminActions } from '@/app/admin/hooks/useAdminActions';
import AdminImagePicker from '@/modules/admin/components/AdminImagePicker';
import { Save, Loader2 } from 'lucide-react';

export default function HeroPage() {
  const { 
    hero: form, 
    setHero: setForm,
    fetchData,
    loading 
  } = useAdminData(['hero']);
  
  const { handleSave, saving } = useAdminActions(fetchData);

  if (loading || !form) return <div className="admin-loading"><Loader2 className="animate-spin" /> Yükleniyor...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Hero</h1><span className="admin-badge">Ana sayfa üst bölüm</span></div>
        <button className="admin-btn admin-btn-primary" onClick={() => handleSave('hero-intro', form)} disabled={saving}>
          <Save size={14} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
      <div className="admin-form-container">
        <div className="admin-form-body">
          <div className="admin-form-grid">
            <div className="admin-form-field admin-form-field-full">
              <label className="admin-label">Başlık</label>
              <input className="admin-input" value={form.left?.title || ''} onChange={e => setForm({ ...form, left: { ...form.left, title: e.target.value } })} />
            </div>
            <div className="admin-form-field admin-form-field-full">
              <label className="admin-label">Alt Başlık (Description)</label>
              <textarea className="admin-textarea" rows={2} value={form.left?.description || ''} onChange={e => setForm({ ...form, left: { ...form.left, description: e.target.value } })} />
            </div>
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">Rozet</label>
              <input className="admin-input" value={form.left?.badge || ''} onChange={e => setForm({ ...form, left: { ...form.left, badge: e.target.value } })} />
            </div>
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">Video URL (Arkaplan için)</label>
              <input className="admin-input" value={form.videoUrl || ''} onChange={e => setForm({ ...form, videoUrl: e.target.value })} />
            </div>
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">CTA Metni</label>
              <input className="admin-input" value={form.left?.ctaText || ''} onChange={e => setForm({ ...form, left: { ...form.left, ctaText: e.target.value } })} />
            </div>
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">CTA Linki</label>
              <input className="admin-input" value={form.left?.ctaLink || ''} onChange={e => setForm({ ...form, left: { ...form.left, ctaLink: e.target.value } })} />
            </div>
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">İkincil CTA Metni</label>
              <input className="admin-input" value={form.left?.ctaSecondaryText || ''} onChange={e => setForm({ ...form, left: { ...form.left, ctaSecondaryText: e.target.value } })} />
            </div>
            <div className="admin-form-field admin-form-field-half">
              <label className="admin-label">İkincil CTA Linki</label>
              <input className="admin-input" value={form.left?.ctaSecondaryLink || ''} onChange={e => setForm({ ...form, left: { ...form.left, ctaSecondaryLink: e.target.value } })} />
            </div>
            <div className="admin-form-field admin-form-field-full">
              <label className="admin-label">Arka Plan Görseli</label>
              <AdminImagePicker value={form.backgroundImage || ''} onChange={(v: string) => setForm({ ...form, backgroundImage: v })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
