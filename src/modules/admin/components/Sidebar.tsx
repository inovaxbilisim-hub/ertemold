"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Palette,
  Settings,
  Users,
} from "lucide-react";
import { useSettings } from "@/modules/settings/context/SettingsContext";
import { sidebarCategories } from "@/app/admin/constants";
import { HookRegistry } from "@/core/hooks/HookRegistry";
import { createTranslator } from "@/i18n";
import type { Locale } from "@/i18n";

interface SidebarProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  locale?: Locale;
}

interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  badge?: string | number;
}

interface SidebarCategory {
  key: string;
  label: string;
  icon: string;
  sort_order: number;
  items: SidebarItem[];
}

const IconComponent = ({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) => {
  switch (name) {
    case "LayoutDashboard":
      return <LayoutDashboard size={size} />;
    case "FileText":
      return <FileText size={size} />;
    case "TrendingUp":
      return <TrendingUp size={size} />;
    case "Palette":
      return <Palette size={size} />;
    case "Settings":
      return <Settings size={size} />;
    case "Users":
      return <Users size={size} />;
    default:
      return <Settings size={size} />;
  }
};

/**
 * Sidebar — DB-driven + i18n destekli navigasyon.
 *
 * Menü önce /api/admin/navigation'dan çekilir (DB).
 * Yüklenemezse constants.ts'deki labelKey'ler createTranslator ile çözülür.
 * Plugin hook'ları (admin_menu) her iki kaynakta da çalışır.
 */
export default function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  isOpen,
  onClose,
  locale = "tr",
}: SidebarProps) {
  const { settings } = useSettings();
  const adminUi = settings?.uiContent?.admin;
  const t = createTranslator(locale);

  const [categories, setCategories] = useState<SidebarCategory[]>([]);
  const [loadedFromDb, setLoadedFromDb] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // DB'den navigasyonu çek
  useEffect(() => {
    fetch("/api/admin/navigation")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
          setLoadedFromDb(true);
        } else {
          // Fallback: constants.ts (i18n labelKey'ler çözülür)
          setCategories(
            sidebarCategories.map((cat) => ({
              key: cat.key,
              label: t(cat.labelKey),
              icon: cat.icon,
              sort_order: 0,
              items: cat.items.map((item) => ({
                id: item.id,
                label: t(item.labelKey),
                href: item.href,
              })),
            })),
          );
        }
      })
      .catch(() => {
        // Fallback: constants.ts (i18n labelKey'ler çözülür)
        setCategories(
          sidebarCategories.map((cat) => ({
            key: cat.key,
            label: t(cat.labelKey),
            icon: cat.icon,
            sort_order: 0,
            items: cat.items.map((item) => ({
              id: item.id,
              label: t(item.labelKey),
              href: item.href,
            })),
          })),
        );
      });
  }, []);

  // Plugin hook'ları ile menüyü özelleştir
  const finalCategories = HookRegistry.applyFilters(
    "admin_menu",
    categories,
  );

  // Aktif kategoriye göre açılır menüyü ayarla
  useEffect(() => {
    const activeCategory = finalCategories.find((cat: SidebarCategory) =>
      cat.items.some((item) => item.id === activeTab),
    );
    if (activeCategory) {
      setExpandedCategories((prev) => ({
        ...prev,
        [activeCategory.key]: true,
      }));
    }
  }, [activeTab, loadedFromDb]);

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLinkClick = (tabId: string) => {
    onTabChange?.(tabId);
    onClose?.();
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "mobile-open" : ""}`}>
      <button
        className="admin-sidebar-close-btn"
        onClick={onClose}
        aria-label={t("common.search", "Menüyü kapat")}
      >
        <X size={16} />
      </button>

      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            {(settings?.companyName || "S")[0]}
          </div>
          <div>
            <h2 className="admin-sidebar-title">
              {settings?.companyName || t("admin.title", "Admin Panel")}
            </h2>
            <p className="admin-sidebar-subtitle">
              {adminUi?.brandBadge || t("admin.title", "Yönetim Paneli")}
            </p>
          </div>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {finalCategories.map((category: SidebarCategory) => {
          const isExpanded = !!expandedCategories[category.key];
          const hasActiveChild = category.items.some(
            (item: SidebarItem) => item.id === activeTab,
          );

          return (
            <div key={category.key} className="admin-sidebar-category-group">
              <button
                type="button"
                onClick={() => toggleCategory(category.key)}
                className={`admin-sidebar-category-trigger ${hasActiveChild ? "has-active" : ""}`}
              >
                <div className="admin-sidebar-category-title">
                  <IconComponent name={category.icon} />
                  <span>{category.label}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>

              <div
                className={`admin-sidebar-submenu ${isExpanded ? "expanded" : ""}`}
              >
                <div className="admin-sidebar-submenu-list">
                  {category.items.map((item: SidebarItem) => (
                    <Link
                      key={item.id}
                      href={item.href || `/admin?tab=${item.id}`}
                      onClick={() => handleLinkClick(item.id)}
                      className={`admin-tab-btn ${activeTab === item.id ? "active" : ""}`}
                    >
                      {item.label}
                      {item.badge && (
                        <span className="admin-badge admin-badge-sm">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <Link
          href="/"
          target="_blank"
          className="admin-tab-btn admin-sidebar-footer-btn"
        >
          <Eye size={16} />
          <span>
            {adminUi?.viewSiteLabel || t("admin.viewSite", "Siteyi Görüntüle")}
          </span>
        </Link>
        <button
          onClick={onLogout}
          className="admin-tab-btn admin-sidebar-footer-btn admin-sidebar-logout"
          type="button"
        >
          <LogOut size={16} />
          <span>
            {adminUi?.logoutLabel || t("admin.logout", "Çıkış Yap")}
          </span>
        </button>
      </div>
    </aside>
  );
}
