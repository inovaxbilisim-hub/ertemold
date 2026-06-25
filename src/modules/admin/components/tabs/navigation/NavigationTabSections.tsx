'use client';

import { Plus, Trash2, X } from 'lucide-react';
import type { LegalPage, NavItem, Page, Service, SiteSettings } from '@/core/types';

interface NavigationTabSectionsProps {
  settings: SiteSettings;
  services: Service[];
  pages: Page[];
  legal: Record<string, LegalPage> | null;
  onUpdate: (data: SiteSettings) => void;
}

interface LinkSelectProps {
  value: string;
  onChange: (value: string) => void;
  services: Service[];
  pages: Page[];
  legal: Record<string, LegalPage> | null;
  includeStaticPages?: boolean;
}

function LinkSelect({ value, onChange, services, pages, legal, includeStaticPages = true }: LinkSelectProps) {
  return (
    <select className="admin-select admin-menu-select" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Sayfa Seç...</option>
      {includeStaticPages ? (
        <optgroup label="Sabit Sayfalar">
          <option value="/">Ana Sayfa</option>
          <option value="/hizmetler">Hizmetler</option>
          <option value="/referanslar">Referanslarımız</option>
          <option value="/lokasyonlar">Hizmet Noktaları</option>
          <option value="/#iletisim">İletişim Alanı</option>
          <option value="/#hakkimizda">Hakkımızda Alanı</option>
          <option value="/#referanslar">Referanslar Alanı</option>
        </optgroup>
      ) : null}
      <optgroup label="Hizmetlerimiz">
        {services.map((service) => (
          <option key={service.id} value={`/hizmetler/${service.id}`}>
            {service.title}
          </option>
        ))}
      </optgroup>
      <optgroup label="Dinamik Sayfalar">
        {pages.map((page) => (
          <option key={page.slug} value={page.slug}>
            {page.title}
          </option>
        ))}
      </optgroup>
      {legal ? (
        <optgroup label="Yasal Sayfalar">
          {Object.entries(legal).map(([key, page]) => (
            <option key={key} value={`/yasal/${key}`}>
              {page.title}
            </option>
          ))}
        </optgroup>
      ) : null}
    </select>
  );
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
  return next;
}

export default function NavigationTabSections({ settings, services, pages, legal, onUpdate }: NavigationTabSectionsProps) {
  const navigation = settings.navigation || [];

  const updateNavigation = (nextNavigation: NavItem[]) => {
    onUpdate({
      ...settings,
      navigation: nextNavigation,
    });
  };

  const updateItem = (index: number, patch: Partial<NavItem>) => {
    const nextNavigation = [...navigation];
    nextNavigation[index] = {
      ...nextNavigation[index],
      ...patch,
    };
    updateNavigation(nextNavigation);
  };

  const updateChild = (parentIndex: number, childIndex: number, patch: { label?: string; href?: string }) => {
    const nextChildren = [...(navigation[parentIndex].children || [])];
    nextChildren[childIndex] = {
      ...nextChildren[childIndex],
      ...patch,
    };
    updateItem(parentIndex, { children: nextChildren });
  };

  return (
    <div className="admin-menu-stack">
      <p className="admin-section-description">
        Web sitenizin üst gezinme menüsünü (Navbar) buradan yönetebilirsiniz. `/hizmetler` linki hizmetleri kategori bazlı mega menü olarak açar.
      </p>

      {navigation.map((item, index) => (
        <section key={`${item.label}-${index}`} className="admin-menu-item-card">
          <div className="admin-menu-grid">
            <div className="admin-menu-reorder">
              <button
                disabled={index === 0}
                onClick={() => updateNavigation(moveItem(navigation, index, index - 1))}
                className="admin-btn admin-btn-sm admin-menu-order-button"
              >
                ^
              </button>
              <button
                disabled={index === navigation.length - 1}
                onClick={() => updateNavigation(moveItem(navigation, index, index + 1))}
                className="admin-btn admin-btn-sm admin-menu-order-button"
              >
                v
              </button>
            </div>

            <input
              className="admin-input"
              placeholder="Menü Adı"
              value={item.label}
              onChange={(event) => updateItem(index, { label: event.target.value })}
            />

            <div className="admin-menu-link-group">
              <input
                className="admin-input"
                placeholder="Link"
                value={item.href}
                onChange={(event) => updateItem(index, { href: event.target.value })}
              />
              <LinkSelect value={item.href} onChange={(value) => updateItem(index, { href: value })} services={services} pages={pages} legal={legal} />
            </div>

            <button onClick={() => updateNavigation(navigation.filter((_, itemIndex) => itemIndex !== index))} className="admin-btn admin-btn-sm admin-btn-danger" title="Sil">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="admin-menu-children">
            {(item.children || []).map((child, childIndex) => (
              <div key={`${child.label}-${childIndex}`} className="admin-menu-child-grid">
                <div className="admin-menu-reorder admin-menu-reorder-compact">
                  <button
                    disabled={childIndex === 0}
                    onClick={() => updateItem(index, { children: moveItem(item.children || [], childIndex, childIndex - 1) })}
                    className="admin-btn admin-btn-sm admin-menu-order-button admin-menu-order-button-small"
                  >
                    ^
                  </button>
                  <button
                    disabled={childIndex === (item.children || []).length - 1}
                    onClick={() => updateItem(index, { children: moveItem(item.children || [], childIndex, childIndex + 1) })}
                    className="admin-btn admin-btn-sm admin-menu-order-button admin-menu-order-button-small"
                  >
                    v
                  </button>
                </div>

                <span className="admin-menu-order-badge">Sıra: {childIndex + 1}</span>

                <input
                  className="admin-input admin-menu-inline-input"
                  placeholder="Alt Menü Adı"
                  value={child.label}
                  onChange={(event) => updateChild(index, childIndex, { label: event.target.value })}
                />

                <div className="admin-menu-child-link-group">
                  <input
                    className="admin-input admin-menu-inline-input"
                    placeholder="Link"
                    value={child.href}
                    onChange={(event) => updateChild(index, childIndex, { href: event.target.value })}
                  />
                  <LinkSelect
                    value={child.href}
                    onChange={(value) => updateChild(index, childIndex, { href: value })}
                    services={services}
                    pages={pages}
                    legal={legal}
                    includeStaticPages={false}
                  />
                </div>

                <button
                  onClick={() => updateItem(index, { children: (item.children || []).filter((_, currentIndex) => currentIndex !== childIndex) })}
                  className="admin-btn admin-btn-sm admin-btn-danger admin-menu-child-remove" title="Sil"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={() => updateItem(index, { children: [...(item.children || []), { label: 'Yeni Alt Menü', href: '#' }] })}
              className="admin-btn admin-btn-sm admin-btn-dashed admin-menu-add-child"
            >
              <Plus size={12} /> Alt Menü Ekle
            </button>
          </div>
        </section>
      ))}

      <button onClick={() => updateNavigation([...(navigation || []), { label: 'Yeni Menü', href: '#' }])} className="admin-btn admin-btn-sm admin-btn-dashed admin-menu-add-root">
        <Plus size={14} /> Yeni Ana Menü Ekle
      </button>

      <style>{`
        .admin-menu-stack { display: flex; flex-direction: column; gap: 16px; }
        .admin-section-description { font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.5; }
        .admin-menu-item-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
        .dark .admin-menu-item-card { background: #1e293b; border-color: #334155; }
        .admin-menu-grid { display: flex; gap: 12px; align-items: center; }
        .admin-menu-reorder { display: flex; flex-direction: column; gap: 4px; }
        .admin-menu-order-button { padding: 2px; min-width: 24px; min-height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10px; }
        .admin-menu-link-group { display: flex; gap: 8px; flex: 1; }
        .admin-menu-children { margin-top: 16px; padding-left: 32px; border-left: 2px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px; }
        .dark .admin-menu-children { border-color: #334155; }
        .admin-menu-child-grid { display: flex; gap: 8px; align-items: center; background: #f8fafc; padding: 8px 12px; border-radius: 6px; }
        .dark .admin-menu-child-grid { background: #0f172a; }
        .admin-menu-reorder-compact { flex-direction: row; }
        .admin-menu-order-badge { font-size: 11px; color: #94a3b8; font-weight: 600; white-space: nowrap; }
        .admin-menu-inline-input { flex: 1; }
        .admin-menu-child-link-group { display: flex; gap: 8px; flex: 2; }
        .admin-menu-add-child { margin-top: 8px; align-self: flex-start; color: #3b82f6; border: 1px dashed #bfdbfe; background: #eff6ff; }
        .dark .admin-menu-add-child { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); }
        .admin-menu-add-root { margin-top: 16px; width: 100%; justify-content: center; padding: 12px; border: 2px dashed #cbd5e1; color: #475569; background: #f8fafc; }
        .dark .admin-menu-add-root { border-color: #334155; background: #1e293b; color: #94a3b8; }
        .admin-menu-select { width: 150px; flex-shrink: 0; }
        @media (max-width: 768px) {
          .admin-menu-grid { flex-direction: column; align-items: stretch; }
          .admin-menu-reorder { flex-direction: row; }
          .admin-menu-link-group { flex-direction: column; }
          .admin-menu-child-grid { flex-direction: column; align-items: stretch; }
          .admin-menu-child-link-group { flex-direction: column; }
          .admin-menu-select { width: 100%; }
        }
      `}</style>
    </div>
  );
}
