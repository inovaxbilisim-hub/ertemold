import { blockRegistry } from '@/domains/block/registry';
import { registerThemeHooks, registerThemeBlocks, enqueueThemeAssets, unregisterThemeHooks } from './functions';
import { applyThemeSettings } from '@/core/registry/theme';
import manifest from './theme.json';

/** ThemeModule interface uyumu için slug ve manifest export */
export const slug = 'default';
export { manifest };

/**
 * Server-side: Hook ve block kayıtları.
 * DOM'a erişim YOK — sadece registry işlemleri.
 */
export function register(_options?: { settings?: Record<string, any> }) {
  registerThemeHooks();
  registerThemeBlocks();
  enqueueThemeAssets();
}

/**
 * Client-side: CSS custom property'leri DOM'a uygula.
 * Sadece ThemeProvider (client component) tarafından çağrılmalı.
 */
export function initTheme(options?: { settings?: Record<string, any> }) {
  if (typeof document === 'undefined') return; // Server-side guard
  const settings = options?.settings || {};
  applyThemeSettings(settings);
}

/**
 * Tema devre dışı bırakıldığında hook ve block kayıtlarını temizle.
 */
export function uninstall() {
  unregisterThemeHooks();
  blockRegistry.clear(); // Block kayıtlarını da temizle
}
