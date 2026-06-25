'use client';

import { useEffect, useState } from 'react';
import { normalizeSlug } from '@/modules/seo/lib/service-utils';
import { Branch } from '@/core/types';

interface CityOption {
  id: number;
  name: string;
  slug: string;
}

interface BranchFormProps {
  item: Partial<Branch>;
  onUpdate: (item: Partial<Branch>) => void;
}

export default function BranchForm({ item, onUpdate }: BranchFormProps) {
  const [cities, setCities] = useState<CityOption[]>([]);

  useEffect(() => {
    fetch('/api/admin/cities')
      .then(r => r.json())
      .then(data => { if (data.success) setCities(data.data); })
      .catch(() => {});
  }, []);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <div className="admin-form-group">
        <label className="admin-label">Şube Adı</label>
        <input 
          type="text" 
          className="admin-input" 
          value={item.title || ''} 
          onChange={e => onUpdate({ ...item, title: e.target.value })} 
          placeholder="Örn: İstanbul Merkez Ofisi"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Şube Tipi</label>
        <select 
          className="admin-select" 
          value={item.type || 'sube'} 
          onChange={e => onUpdate({ ...item, type: e.target.value as 'merkez' | 'sube' })}
        >
          <option value="merkez">Merkez</option>
          <option value="sube">Şube</option>
        </select>
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Şehir</label>
        <select 
          className="admin-select" 
          value={item.city_name || ''} 
          onChange={e => {
            const city = e.target.value;
            onUpdate({ 
              ...item, 
              city_name: city,
              city_slug: normalizeSlug(city)
            });
          }}
        >
          <option value="">Şehir Seçin</option>
          {cities.map(city => (
            <option key={city.id} value={city.name}>{city.name}</option>
          ))}
        </select>
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Telefon</label>
        <input 
          type="text" 
          className="admin-input" 
          value={item.phone || ''} 
          onChange={e => onUpdate({ ...item, phone: e.target.value })} 
          placeholder="+90 (212) ..."
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label">E-Posta</label>
        <input 
          type="email" 
          className="admin-input" 
          value={item.email || ''} 
          onChange={e => onUpdate({ ...item, email: e.target.value })} 
          placeholder="info@example.com"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Sıralama (Küçükten Büyüğe)</label>
        <input 
          type="number" 
          className="admin-input" 
          value={item.sort_order || 0} 
          onChange={e => onUpdate({ ...item, sort_order: parseInt(e.target.value) })} 
        />
      </div>

      <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
        <label className="admin-label">Tam Adres</label>
        <textarea 
          className="admin-textarea" 
          value={item.address || ''} 
          onChange={e => onUpdate({ ...item, address: e.target.value })} 
          rows={3}
          placeholder="Mahalle, Cadde, Sokak No..."
        />
      </div>

      <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
        <label className="admin-label">Google Maps Linki</label>
        <input 
          type="url" 
          className="admin-input" 
          value={item.maps_link || ''} 
          onChange={e => onUpdate({ ...item, maps_link: e.target.value })} 
          placeholder="https://maps.google.com/?q=..."
        />
      </div>

      <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
        <label className="admin-label">Google Maps Embed HTML</label>
        <textarea 
          className="admin-textarea" 
          value={item.maps_embed || ''} 
          onChange={e => onUpdate({ ...item, maps_embed: e.target.value })} 
          rows={4}
          placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
        />
      </div>

      <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginTop: '20px', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Çalışma Saatleri</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>
          * Şubenin haftalık çalışma saatlerini JSON formatında girin. Boş bırakılırsa varsayılan saatler kullanılır.
        </p>
        <div className="admin-form-group">
          <label className="admin-label">Çalışma Saatleri (JSON)</label>
          <textarea 
            className="admin-textarea" 
            value={typeof item.working_hours === 'string' ? item.working_hours : JSON.stringify(item.working_hours || {}, null, 2)} 
            onChange={e => onUpdate({ ...item, working_hours: e.target.value as any })} 
            rows={6}
            placeholder='{"mon_fri":{"opens":"09:00","closes":"18:00"},"sat":{"opens":"10:00","closes":"16:00"},"sun":{"opens":"Kapalı","closes":"Kapalı"}}'
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          />
        </div>
      </div>

      <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginTop: '20px', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>SMTP Ayarları (Opsiyonel)</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>
          * Bu şubeye özel bir mail sunucusu kullanmak istiyorsanız doldurun. Boş bırakılırsa merkezi ayarlara tabi olur.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-label">SMTP Host</label>
            <input 
              type="text" 
              className="admin-input" 
              value={item.smtp_settings?.host || ''} 
              onChange={e => onUpdate({ ...item, smtp_settings: { ...(item.smtp_settings || {}), host: e.target.value } })} 
              placeholder="mail.example.com"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">SMTP Port</label>
            <input 
              type="number" 
              className="admin-input" 
              value={item.smtp_settings?.port || ''} 
              onChange={e => onUpdate({ ...item, smtp_settings: { ...(item.smtp_settings || {}), port: parseInt(e.target.value) } })} 
              placeholder="587"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">SMTP Kullanıcı</label>
            <input 
              type="text" 
              className="admin-input" 
              value={item.smtp_settings?.user || ''} 
              onChange={e => onUpdate({ ...item, smtp_settings: { ...(item.smtp_settings || {}), user: e.target.value } })} 
              placeholder="istanbul@example.com"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">SMTP Şifre</label>
            <input 
              type="password" 
              className="admin-input" 
              value={item.smtp_settings?.pass || ''} 
              onChange={e => onUpdate({ ...item, smtp_settings: { ...(item.smtp_settings || {}), pass: e.target.value } })} 
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
        <label className="admin-label">Özellikler (virgülle ayrılmış)</label>
        <input 
          type="text" 
          className="admin-input" 
          value={Array.isArray(item.amenities) ? item.amenities.join(', ') : (item.amenities || '')} 
          onChange={e => onUpdate({ ...item, amenities: e.target.value as any })} 
          placeholder="WiFi, Otopark, Kafe"
        />
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
          * Şubede sunulan olanakları virgülle ayırarak yazın (örn: WiFi, Otopark, Kafe, Çocuk Oyun Alanı).
        </p>
      </div>

      <div className="admin-form-group">
        <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={!!item.active} 
            onChange={e => onUpdate({ ...item, active: e.target.checked })}
          />
          Sitede Yayınla (Aktif)
        </label>
      </div>
    </div>
  );
}

