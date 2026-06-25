import { THEME_REGISTRY } from '@/core/registry/theme';
import { getThemeCSS } from '@/core/registry/theme-server';

// Her SSR request'te register() tekrar çalışmaması için cache
const REGISTERED_THEMES_KEY = '__ERTEM_REGISTERED_THEMES__';
const gAny = globalThis as unknown as Record<string, Set<string>>;
if (!gAny[REGISTERED_THEMES_KEY]) {
  gAny[REGISTERED_THEMES_KEY] = new Set<string>();
}
const registeredThemes = gAny[REGISTERED_THEMES_KEY];

interface ThemeLoaderProps {
  activeTheme: string;
  themeSettings?: Record<string, any>;
}

/**
 * ThemeLoader is a Server Component that loads the active theme.
 * It injects theme CSS into <head> and registers theme hooks/blocks.
 *
 * PERFORMANCE: register() is only called ONCE per server process per theme
 * (guarded by globalThis set). Subsequent requests skip the registration step.
 */
export async function ThemeLoader({ activeTheme, themeSettings = {} }: ThemeLoaderProps) {
  let ThemeComponent: any = null;
  let themeCSS = '';

  try {
    if (!activeTheme) return null;

    const themeSlug = activeTheme as keyof typeof THEME_REGISTRY;

    if (THEME_REGISTRY[themeSlug]) {
      const themeModule = await THEME_REGISTRY[themeSlug]();

      // register() sadece bir kez çalışmalı — globalThis guard ile
      if (!registeredThemes.has(themeSlug)) {
        if (themeModule.register) {
          themeModule.register({ settings: themeSettings });
          registeredThemes.add(themeSlug);
        }
      }

      if (themeModule.default) {
        ThemeComponent = themeModule.default;
      }
    }

    // Load theme CSS (skip for default — it's built into globals.css)
    themeCSS = activeTheme !== 'default' ? getThemeCSS(activeTheme) : '';
  } catch (error) {
    console.error('ThemeLoader failed to load theme:', error);
    return null;
  }

  return (
    <>
      {themeCSS && (
        <style
          dangerouslySetInnerHTML={{ __html: themeCSS }}
        />
      )}
      {ThemeComponent && <ThemeComponent options={{ settings: themeSettings }} />}
    </>
  );
}
