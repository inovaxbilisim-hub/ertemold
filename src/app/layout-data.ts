import { cache } from 'react';
import { getSettings, getAppearanceTheme } from '@/lib/data';
import { loadActivePlugins } from '@/core/hooks/PluginLoader';
import type { SiteSettings } from '@/core/types';

// ---------------------------------------------------------------------------
// Request-level memoization: her render tree'de en fazla 1 kez çalışır
// ---------------------------------------------------------------------------

/** Aktif temayı DB'den al — request içinde memoize edilir */
const getCachedActiveTheme = cache(async (): Promise<string> => {
  const { getActiveThemeFromDB } = await import('@/core/registry/theme-server');
  return getActiveThemeFromDB();
});

/** Tema ayarlarını DB'den al — process boyunca 60 sn cache */
const THEME_SETTINGS_CACHE_KEY = '__ERTEM_THEME_SETTINGS_CACHE__';
const gAny = globalThis as any;
if (!gAny[THEME_SETTINGS_CACHE_KEY]) gAny[THEME_SETTINGS_CACHE_KEY] = { data: {}, ts: 0 };

async function getCachedThemeSettings(slug: string): Promise<Record<string, any>> {
  const CACHE_TTL_MS = 60_000; // 60 saniye
  const entry = gAny[THEME_SETTINGS_CACHE_KEY];
  if (Date.now() - entry.ts < CACHE_TTL_MS && entry.data[slug]) {
    return entry.data[slug];
  }
  try {
    const { dbGet } = await import('@/core/database/db');
    const row = await dbGet<{ settings: any }>(
      'SELECT settings FROM themes WHERE slug = $1 LIMIT 1',
      [slug],
    );
    const parsed = row?.settings
      ? (typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings)
      : {};
    gAny[THEME_SETTINGS_CACHE_KEY] = { data: { ...entry.data, [slug]: parsed }, ts: Date.now() };
    return parsed;
  } catch {
    return {};
  }
}

export interface LayoutData {
  settings: SiteSettings | null;
  themeVarsCSS: string;
  activeTheme: string;
  themeSettings: Record<string, any>;
  locale: string;
  gtmId: string | null;
  headActive: boolean;
  bodyStartActive: boolean;
  bodyEndActive: boolean;
}


export async function fetchLayoutData(): Promise<LayoutData> {
  const [settings, theme] = await Promise.all([
    getSettings().catch(() => null),
    getAppearanceTheme().catch(() => ''),
  ]);

  const activeTheme = await getCachedActiveTheme();
  const themeSettings = activeTheme ? await getCachedThemeSettings(activeTheme) : {};
  
  const activePlugins = settings?.active_plugins || [];
  if (activePlugins.length > 0) {
    await loadActivePlugins(activePlugins, { failFast: false });
  }

  const locale = 'tr';
  const gtmIdRaw = settings?.codeInjection?.gtmId;
  const gtmIdTrimmed = typeof gtmIdRaw === 'string' ? gtmIdRaw.trim() : '';
  const gtmId = gtmIdTrimmed && /^GTM-[A-Z0-9]+$/i.test(gtmIdTrimmed) ? gtmIdTrimmed.toUpperCase() : null;

  const headActive = !!settings?.codeInjection?.headActive;
  const bodyStartActive = !!settings?.codeInjection?.bodyStartActive;
  const bodyEndActive = !!settings?.codeInjection?.bodyEndActive;

  return {
    settings,
    themeVarsCSS: theme,
    activeTheme,
    themeSettings,
    locale,
    gtmId,
    headActive,
    bodyStartActive,
    bodyEndActive,
  };
}
