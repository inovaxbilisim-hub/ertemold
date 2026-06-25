'use client';

import type { ComponentType } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Facebook, Instagram, Linkedin, Youtube } from '@/shared/components/BrandIcons';
import type { FooterLink, FooterLinkGroup, SiteSettings, SocialMedia, FooterUiContent } from '@/core/types';
import AdminImagePicker from '@/modules/admin/components/AdminImagePicker';

interface FooterTabSectionsProps {
  settings: SiteSettings;
  onUpdate: (data: SiteSettings) => void;
}

type SocialIconComponent = ComponentType<{ size?: number }>;

function SectionTitle({ children }: { children: string }) {
  return <h4 className="admin-settings-section-title">{children}</h4>;
}

// ─── Link Group Editor ─────────────────────────────────────────────────────
function LinkGroupEditor({
  group,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  group: FooterLinkGroup;
  index: number;
  total: number;
  onChange: (g: FooterLinkGroup) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const updateLink = (li: number, field: keyof FooterLink, val: string) => {
    const links = [...group.links];
    links[li] = { ...links[li], [field]: val };
    onChange({ ...group, links });
  };

  const removeLink = (li: number) => {
    const links = group.links.filter((_, i) => i !== li);
    onChange({ ...group, links });
  };

  const addLink = () => {
    onChange({ ...group, links: [...group.links, { label: 'Yeni Link', href: '#' }] });
  };

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'var(--surface-2)',
      marginBottom: '12px',
    }}>
      {/* Group header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: 'var(--surface)',
        borderBottom: collapsed ? 'none' : '1px solid var(--border)',
      }}>
        <GripVertical size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

        <input
          className="admin-input"
          style={{ flex: 1, fontWeight: 600, fontSize: '14px' }}
          placeholder="Grup başlığı (örn: Hizmetler)"
          value={group.title}
          onChange={e => onChange({ ...group, title: e.target.value })}
        />

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="admin-btn admin-btn-sm"
            title="Yukarı Taşı"
            style={{ opacity: index === 0 ? 0.3 : 1 }}
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="admin-btn admin-btn-sm"
            title="Aşağı Taşı"
            style={{ opacity: index === total - 1 ? 0.3 : 1 }}
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="admin-btn admin-btn-sm"
            title={collapsed ? 'Genişlet' : 'Daralt'}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button onClick={onRemove} className="admin-btn admin-btn-sm admin-btn-danger" title="Grubu Sil">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Group links */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {group.links.map((link, li) => (
            <div key={li} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                className="admin-input"
                style={{ flex: 1.2 }}
                placeholder="Etiket (örn: Hizmetler)"
                value={link.label}
                onChange={e => updateLink(li, 'label', e.target.value)}
              />
              <input
                className="admin-input"
                style={{ flex: 2 }}
                placeholder="URL (örn: /hizmetler)"
                value={link.href}
                onChange={e => updateLink(li, 'href', e.target.value)}
              />
              <button
                onClick={() => removeLink(li)}
                className="admin-btn admin-btn-sm admin-btn-danger"
                title="Linki Sil"
                style={{ flexShrink: 0 }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <button onClick={addLink} className="admin-btn admin-btn-sm admin-btn-dashed" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
            <Plus size={13} /> Link Ekle
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Flat link list (bottom bar) ────────────────────────────────────────────
function FlatLinkList({
  title, links, onChange,
}: { title: string; links: FooterLink[]; onChange: (links: FooterLink[]) => void }) {
  const update = (i: number, field: keyof FooterLink, val: string) => {
    const next = [...links];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  return (
    <section className="admin-settings-panel admin-settings-panel-full">
      <SectionTitle>{title}</SectionTitle>
      <div className="admin-footer-link-list">
        {links.map((link, i) => (
          <div key={i} className="admin-footer-link-row">
            <input className="admin-input" placeholder="Etiket" value={link.label} onChange={e => update(i, 'label', e.target.value)} />
            <input className="admin-input" placeholder="URL" value={link.href} onChange={e => update(i, 'href', e.target.value)} />
            <button onClick={() => onChange(links.filter((_, j) => j !== i))} className="admin-btn admin-btn-sm admin-btn-danger"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => onChange([...links, { label: 'Yeni Link', href: '#' }])} className="admin-btn admin-btn-sm admin-btn-dashed">
          <Plus size={14} /> Link Ekle
        </button>
      </div>
    </section>
  );
}

// ─── Social card ────────────────────────────────────────────────────────────
function SocialMediaCard({ item, onChange }: { item: SocialMedia; onChange: (next: SocialMedia) => void }) {
  const socialIcons: Record<string, SocialIconComponent> = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube };
  const Icon = socialIcons[item.platform.toLowerCase()] || (() => null);
  return (
    <div className="admin-footer-social-card">
      <div className="admin-footer-social-header">
        <div className="admin-footer-social-title">
          <div className="admin-footer-social-icon"><Icon size={18} /></div>
          <span className="admin-footer-social-name">{item.platform}</span>
        </div>
        <label className="admin-footer-social-toggle">
          <input type="checkbox" checked={item.active} onChange={e => onChange({ ...item, active: e.target.checked })} />
          Aktif
        </label>
      </div>
      <input className="admin-input" placeholder={`${item.platform} Profil URL`} value={item.url} onChange={e => onChange({ ...item, url: e.target.value })} />
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function FooterTabSections({ settings, onUpdate }: FooterTabSectionsProps) {
  const groups: FooterLinkGroup[] = settings.footerLinkGroups || [];

  const updateGroups = (g: FooterLinkGroup[]) => onUpdate({ ...settings, footerLinkGroups: g });
  const updateGroup = (i: number, g: FooterLinkGroup) => { const next = [...groups]; next[i] = g; updateGroups(next); };
  const removeGroup = (i: number) => updateGroups(groups.filter((_, j) => j !== i));
  const moveGroup = (i: number, dir: -1 | 1) => {
    const next = [...groups];
    const tmp = next[i]; next[i] = next[i + dir]; next[i + dir] = tmp;
    updateGroups(next);
  };
  const addGroup = () => updateGroups([...groups, { title: 'Yeni Bölüm', links: [] }]);

  const updateUiFooter = (field: keyof FooterUiContent, value: string) => {
    onUpdate({ ...settings, uiContent: { ...settings.uiContent, footer: { ...settings.uiContent.footer, [field]: value } } });
  };

  return (
    <div className="admin-settings-grid">

      {/* ── General ── */}
      <section className="admin-settings-panel admin-settings-panel-full">
        <SectionTitle>Genel Bilgiler</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>

          <div>
            <label className="admin-label">Footer Logosu</label>
            <div style={{ marginTop: '8px' }}>
              <AdminImagePicker
                label="Logoyu Değiştir"
                value={settings.brand?.footerLogoPath || settings.brand?.logoPath || ''}
                onChange={value => onUpdate({ ...settings, brand: { ...settings.brand, footerLogoPath: value } })}
              />
            </div>
            {settings.brand?.logoPath && !settings.brand?.footerLogoPath && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Not: Şu anda genel site logosu kullanılıyor.
              </p>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div>
                <label className="admin-label">Logo Maksimum Genişlik (px)</label>
                <input 
                  type="number" 
                  className="admin-input" 
                  placeholder="Örn: 200"
                  value={settings.brand?.footerLogoMaxWidth || ''} 
                  onChange={e => onUpdate({ ...settings, brand: { ...settings.brand, footerLogoMaxWidth: e.target.value ? Number(e.target.value) : undefined } })} 
                />
              </div>
              <div>
                <label className="admin-label">Logo Maksimum Yükseklik (px)</label>
                <input 
                  type="number" 
                  className="admin-input" 
                  placeholder="Örn: 60"
                  value={settings.brand?.footerLogoMaxHeight || ''} 
                  onChange={e => onUpdate({ ...settings, brand: { ...settings.brand, footerLogoMaxHeight: e.target.value ? Number(e.target.value) : undefined } })} 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="admin-label">Footer Kısa Açıklama</label>
            <textarea
              className="admin-input"
              style={{ minHeight: '80px', paddingTop: '10px' }}
              value={settings.companyDescription || ''}
              onChange={e => onUpdate({ ...settings, companyDescription: e.target.value })}
              placeholder="Footer'da logonun altında görünecek kısa açıklama..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="admin-label">İletişim Bölümü Başlığı</label>
              <input className="admin-input" value={settings.uiContent.footer.contactTitle} onChange={e => updateUiFooter('contactTitle', e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Copyright Yazısı</label>
              <input className="admin-input" value={settings.uiContent.footer.copyrightText} onChange={e => updateUiFooter('copyrightText', e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Link Groups ── */}
      <section className="admin-settings-panel admin-settings-panel-full">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <SectionTitle>Footer Link Grupları</SectionTitle>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Her grup footer'da ayrı bir sütun olarak görünür. Sıralamayı yukarı/aşağı oklarla değiştirebilirsiniz.
            </p>
          </div>
          <button onClick={addGroup} className="admin-btn admin-btn-sm admin-btn-primary" style={{ flexShrink: 0 }}>
            <Plus size={14} /> Grup Ekle
          </button>
        </div>

        {groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            <div style={{ marginBottom: '16px', color: 'var(--color-warning)', background: 'var(--color-warning-muted)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
              ⚠️ Henüz özel bir link grubu oluşturmadınız. Ziyaretçilere sitenizin ana menüsünden alınan linkler (dinamik şablon) gösteriliyor. Sektörünüze uygun grupları manuel eklemeniz önerilir.
            </div>
            <button onClick={addGroup} className="admin-btn admin-btn-sm admin-btn-dashed">
              <Plus size={14} /> İlk Grubu Ekle
            </button>
          </div>
        ) : (
          <div>
            {groups.map((group, i) => (
              <LinkGroupEditor
                key={i}
                group={group}
                index={i}
                total={groups.length}
                onChange={g => updateGroup(i, g)}
                onRemove={() => removeGroup(i)}
                onMoveUp={() => moveGroup(i, -1)}
                onMoveDown={() => moveGroup(i, 1)}
              />
            ))}
          </div>
        )}

        <div style={{ marginTop: '12px', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          💡 <strong>İpucu:</strong> Eğer grup oluşturmazsanız, eski "Footer Linkleri" listesi otomatik olarak 2 sütuna bölünür.
        </div>
      </section>

      {/* ── Bottom Bar Links ── */}
      <FlatLinkList
        title="Alt Çubuk Linkleri (Gizlilik, KVKK vb.)"
        links={settings.footerBottomLinks || []}
        onChange={l => onUpdate({ ...settings, footerBottomLinks: l })}
      />

      {/* ── Social Media ── */}
      <section className="admin-settings-panel admin-settings-panel-full">
        <SectionTitle>Sosyal Medya Hesapları</SectionTitle>
        <div className="admin-footer-social-grid">
          {(settings.socialMedia || []).map((item, i) => (
            <SocialMediaCard
              key={`${item.platform}-${i}`}
              item={item}
              onChange={next => {
                const socialMedia = [...(settings.socialMedia || [])];
                socialMedia[i] = next;
                onUpdate({ ...settings, socialMedia });
              }}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
