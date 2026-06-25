type Tab = string;

export interface SidebarCategory {
  /** i18n key for label — resolved at runtime via createTranslator */
  labelKey: string;
  key: string;
  icon: string;
  description?: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  labelKey: string;
  href?: string;
  badge?: string;
}

/**
 * Sidebar categories with i18n label keys instead of hardcoded strings.
 */
export const sidebarCategories: SidebarCategory[] = [
  {
    labelKey: 'admin.categories.overview',
    key: 'overview',
    icon: 'LayoutDashboard',
    items: [{ id: 'dashboard', labelKey: 'admin.menu.dashboard' }],
  },
  {
    labelKey: 'admin.categories.content',
    key: 'content',
    icon: 'FileText',
    items: [
      { id: 'pages', labelKey: 'admin.menu.pages' },
      { id: 'services', labelKey: 'admin.menu.services' },
      { id: 'references', labelKey: 'admin.menu.references' },
      { id: 'sectors', labelKey: 'admin.menu.sectors' },
      { id: 'faqs', labelKey: 'admin.menu.faqs' },
      { id: 'stats', labelKey: 'admin.menu.stats' },
    ],
  },
  {
    labelKey: 'admin.categories.seo',
    key: 'seo',
    icon: 'TrendingUp',
    items: [
      { id: 'pseo', labelKey: 'admin.menu.pseo' },
      { id: 'pseo_locations', labelKey: 'admin.menu.pseo_locations' },
      { id: 'ai_settings', labelKey: 'admin.menu.ai_settings' },
      { id: 'seo', labelKey: 'admin.menu.seo' },
    ],
  },
  {
    labelKey: 'admin.categories.design',
    key: 'design',
    icon: 'Palette',
    items: [
      { id: 'navigation', labelKey: 'admin.menu.navigation' },
      { id: 'footer', labelKey: 'admin.menu.footer' },
      { id: 'sections', labelKey: 'admin.menu.sections' },
      { id: 'hero', labelKey: 'admin.menu.hero' },
    ],
  },
  {
    labelKey: 'admin.categories.system',
    key: 'system',
    icon: 'Settings',
    items: [
      { id: 'settings', labelKey: 'admin.menu.settings' },
      { id: 'branches', labelKey: 'admin.menu.branches' },
      { id: 'themes', labelKey: 'admin.menu.themes', href: '/admin/system/themes' },
      { id: 'plugins', labelKey: 'admin.menu.plugins' },
      { id: 'users', labelKey: 'admin.menu.users', href: '/admin/system/users' },
      { id: 'legal', labelKey: 'admin.menu.legal' },
    ],
  },
];

const sidebarItems = sidebarCategories.flatMap((c) => c.items);