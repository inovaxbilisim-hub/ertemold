"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search, MapPin, Droplets, Factory, Save, X,
  Settings, Thermometer, Info, Globe, CheckCircle2
} from 'lucide-react';

export default function LocationMetadataTab() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLoc, setEditingLoc] = useState<any>(null);
  const [saving, setSaving] = useState(false);


  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pseo/locations');
      const data = await res.json();
      if (data.success) setLocations(data.data);
    } catch {
      toast.error('Lokasyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);
  

  const handleEdit = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pseo/locations?city_slug=${slug}`);
      const data = await res.json();
      if (data.success) {
        const loc = data.data;
        setEditingLoc({
          ...loc,
          osb_list: typeof loc.osb_list === 'string' ? JSON.parse(loc.osb_list) : (loc.osb_list || []),
          industry_profile: typeof loc.industry_profile === 'string' ? JSON.parse(loc.industry_profile) : (loc.industry_profile || {})
        });
      }
    } catch {
      toast.error('Detaylar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pseo/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLoc)
      });
      if (res.ok) {
        toast.success(`${editingLoc.city_name} ayarları kaydedildi`);
        setEditingLoc(null);
        fetchLocations();
      }
    } catch {
      toast.error('Kayıt hatası');
    } finally {
      setSaving(false);
    }
  };

  const filteredLocations = locations.filter(l => 
    l.city_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-card-list-stack">
      {/* Header & Search */}
      <div className="admin-card" style={{ padding: '24px' }}>
        <div className="admin-toolbar" style={{ marginBottom: 0 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="81 il içerisinde ara..." 
              className="admin-input" 
              style={{ paddingLeft: '44px', borderRadius: '14px' }} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={16} className="text-emerald-500" />
            81 Lokasyon / Türkiye Geneli pSEO Aktif
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '16px',
        marginTop: '20px'
      }}>
        {loading && !locations.length ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="admin-entity-card animate-pulse" style={{ height: '80px', background: 'var(--bg-secondary)' }} />
          ))
        ) : (
          filteredLocations.map(loc => (
            <div 
              key={loc.city_slug} 
              className={`admin-entity-card transition-all hover:scale-[1.02] ${loc.has_custom_data ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
              style={{ cursor: 'pointer', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-subtle)' }}
              onClick={() => handleEdit(loc.city_slug)}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${loc.has_custom_data ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <MapPin size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {loc.city_name}
                </div>
                <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Droplets size={12} /> {loc.humidity_group} NEM
                  </span>
                  {loc.has_custom_data && (
                    <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-tighter">ÖZEL VERİ</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingLoc && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="admin-card animate-in fade-in zoom-in duration-200" style={{ 
            width: '100%', maxWidth: '1000px', maxHeight: '90vh', 
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-subtle)', borderRadius: '24px'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '24px', borderBottom: '1px solid var(--border-subtle)', 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                  <Settings size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>{editingLoc.city_name} Ayarları</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bu ile ait tüm pSEO, İklim ve Sektörel parametreler</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="admin-btn" 
                  onClick={() => setEditingLoc(null)}
                >
                  <X size={16} /> İptal
                </button>
                <button 
                  className="admin-btn admin-btn-primary" 
                  onClick={handleSave} 
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                
                {/* Sol Kolon: İklim & Temel */}
                <div className="space-y-8">
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-6">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Thermometer size={16} /> İklim ve Coğrafya
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="admin-form-group">
                        <label className="admin-label">Nem Grubu</label>
                        <select 
                          className="admin-input" 
                          value={editingLoc.humidity_group}
                          onChange={e => setEditingLoc({...editingLoc, humidity_group: e.target.value})}
                        >
                          <option value="LOW">Düşük (LOW)</option>
                          <option value="MED">Orta (MED)</option>
                          <option value="HIGH">Yüksek (HIGH)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="admin-form-group">
                        <label className="admin-label">En Yüksek Yaz Sıcaklığı (°C)</label>
                        <input 
                          type="number" className="admin-input" 
                          value={editingLoc.max_temp_summer_c}
                          onChange={e => setEditingLoc({...editingLoc, max_temp_summer_c: Number(e.target.value)})}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">En Düşük Kış Sıcaklığı (°C)</label>
                        <input 
                          type="number" className="admin-input" 
                          value={editingLoc.min_temp_winter_c}
                          onChange={e => setEditingLoc({...editingLoc, min_temp_winter_c: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-3xl space-y-6 border border-blue-100">
                    <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      <Globe size={16} /> Özel SEO Ayarları (Override)
                    </h4>
                    <div className="admin-form-group">
                      <label className="admin-label">Özel SEO Başlığı</label>
                      <input 
                        type="text" className="admin-input" 
                        placeholder="Boş bırakılırsa otomatik üretilir"
                        value={editingLoc.seo_title || ''}
                        onChange={e => setEditingLoc({...editingLoc, seo_title: e.target.value})}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Özel Meta Açıklama</label>
                      <textarea 
                        className="admin-input" rows={3}
                        placeholder="Boş bırakılırsa otomatik üretilir"
                        value={editingLoc.seo_description || ''}
                        onChange={e => setEditingLoc({...editingLoc, seo_description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon: Sanayi & İlçeler */}
                <div className="space-y-8">
                  <div className="p-6 bg-orange-50 rounded-3xl space-y-6 border border-orange-100">
                    <h4 className="text-sm font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                      <Factory size={16} /> Endüstriyel Profil
                    </h4>
                    <div className="admin-form-group">
                      <label className="admin-label">OSB Listesi (Virgülle Ayırın)</label>
                      <textarea 
                        className="admin-input" rows={4}
                        value={Array.isArray(editingLoc.osb_list) ? editingLoc.osb_list.join(', ') : editingLoc.osb_list}
                        onChange={e => setEditingLoc({...editingLoc, osb_list: e.target.value.split(',').map(s => s.trim())})}
                        placeholder="Örn: İkitelli OSB, İMES, Gebze OSB..."
                      />
                    </div>
                  </div>


                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                 <Info size={14} /> Bu değişiklikler tıklandığı an tüm dinamik pSEO sayfalarına yansır.
               </div>
               <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input 
                      type="checkbox" checked={editingLoc.is_active} 
                      onChange={e => setEditingLoc({...editingLoc, is_active: e.target.checked})}
                    />
                    PSEO Aktif
                  </label>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
