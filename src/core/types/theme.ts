export interface ThemeManifest {
  slug: string;
  name: string;
  description: string;
  author: string;
  version: string;
  /** Parent tema slug'u — child theme desteği için */
  parent?: string;
  /** Minimum sistem versiyonu */
  requires?: string;
  /** Admin panel önizleme görseli yolu */
  screenshot?: string;
  /** Tema etiketleri */
  tags?: string[];
  /** Tema özellik desteği */
  support?: {
    customHeader?: boolean;
    customBackground?: boolean;
    widgetAreas?: string[];
  };
  settingsSchema?: Record<string, ThemeSettingDefinition>;
}

export interface ThemeSettingDefinition {
  type: 'text' | 'color' | 'image' | 'select' | 'checkbox' | 'number' | 'range';
  label: string;
  default?: any;
  options?: { label: string; value: string }[];
  section: 'general' | 'colors' | 'layout' | 'typography' | 'header' | 'footer' | 'custom';
  placeholder?: string;
  helpText?: string;
}

interface ThemeModule {
  /** Tema slug'u (ThemeManifest.slug ile eşleşmeli) */
  slug?: string;
  /** Tema manifest nesnesi */
  manifest?: ThemeManifest;
  /**
   * Server-side: Hook ve block kayıtları.
   * DOM erişimi yapmamalı — sadece registry işlemleri.
   */
  register: (options?: { settings?: Record<string, any> }) => void;
  /**
   * Client-side: CSS custom property'leri DOM'a uygula.
   * Sadece ThemeProvider (client component) tarafından çağrılmalı.
   */
  initTheme?: (options?: { settings?: Record<string, any> }) => void;
  /** Tema devre dışı bırakıldığında hook ve block kayıtlarını temizle */
  uninstall?: () => void;
  /** WordPress functions.php benzeri ek özelleştirmeler */
  functions?: () => void;
}

export interface ThemeConfig {
  slug: string;
  name: string;
  description: string;
  author: string;
  version: string;
  /** Parent tema slug'u */
  parent?: string;
  active: boolean;
  isSystem: boolean;
  settings: Record<string, any>;
  manifest: ThemeManifest | null;
  error?: string;
}
