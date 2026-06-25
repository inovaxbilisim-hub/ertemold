/**
 * theme.ts — Client-safe tema registry.
 *
 * Bu dosya client component'lardan güvenle import edilebilir.
 * Server-only fonksiyonlar (DB, filesystem) için:
 *   → @/core/registry/theme-server
 */

// ---------------------------------------------------------------------------
// THEME REGISTRY
// ---------------------------------------------------------------------------

export const THEME_REGISTRY: Record<string, () => Promise<any>> = {
  default: () => import('@/themes/default'),
  // Yeni tema eklendiğinde buraya loader eklenmeli:
  // 'my-theme': () => import('@/themes/my-theme'),
};

/**
 * Runtime'da dinamik tema kaydı (admin panel üzerinden kurulum).
 */
function registerTheme(slug: string, loader: () => Promise<any>): void {
  if (THEME_REGISTRY[slug]) {
    console.warn(`[ThemeRegistry] Overwriting existing theme registration: ${slug}`);
  }
  THEME_REGISTRY[slug] = loader;
}

// ---------------------------------------------------------------------------
// GLOBAL ASSET REGISTRY (WordPress-like wp_enqueue_style/script)
// ---------------------------------------------------------------------------

export type AssetState = {
  styles: Map<string, string>;
  scripts: Map<string, string>;
  blocks: Map<string, React.ComponentType<any>>;
};

const registryState: AssetState = {
  styles: new Map(),
  scripts: new Map(),
  blocks: new Map(),
};

function enqueueStyle(handle: string, cssContent: string) {
  registryState.styles.set(handle, cssContent);
}

function enqueueScript(handle: string, jsContent: string) {
  registryState.scripts.set(handle, jsContent);
}

function registerBlock(handle: string, component: React.ComponentType<any>) {
  registryState.blocks.set(handle, component);
}

function getEnqueuedStyles(): Array<[string, string]> {
  return Array.from(registryState.styles.entries());
}

function getEnqueuedScripts(): Array<[string, string]> {
  return Array.from(registryState.scripts.entries());
}

function getRegisteredBlock(handle: string): React.ComponentType<any> | undefined {
  return registryState.blocks.get(handle);
}

function clearEnqueuedAssets(): void {
  registryState.styles.clear();
  registryState.scripts.clear();
}

// ---------------------------------------------------------------------------
// CLIENT-SIDE: CSS Custom Properties
// ---------------------------------------------------------------------------

/**
 * Tema ayarlarını CSS custom property olarak DOM'a uygular.
 * Client-side ThemeProvider veya initTheme() tarafından çağrılır.
 */
export function applyThemeSettings(settings: Record<string, any>): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const varMap: Record<string, string> = {
    primary_color:       '--color-primary-val',
    primary_dark_color:  '--color-primary-dark-val',
    secondary_color:     '--color-secondary-val',
    accent_color:        '--color-accent-val',
    accent_teal:         '--accent-teal',
    accent_blue:         '--accent-blue',
    accent_orange:       '--accent-orange',
  };

  for (const [key, cssVar] of Object.entries(varMap)) {
    if (settings[key]) root.style.setProperty(cssVar, settings[key]);
  }

  if (settings.border_radius) {
    root.style.setProperty('--theme-border-radius', `${settings.border_radius}px`);
  }
  if (settings.max_width) {
    root.style.setProperty('--theme-max-width', `${settings.max_width}px`);
  }
}
