/**
 * Default Theme Functions
 * WordPress functions.php benzeri - hook'lar ve özelleştirmeler
 * Hook isimleri string literal değil, sabit (const) kullanılır — type-safety için.
 */

import { HookRegistry } from '@/core/hooks/HookRegistry';
import { blockRegistry } from '@/domains/block/registry';
import { assetManager } from '@/core/assets/AssetManager';
import {
  TEMPLATE_HEAD_ELEMENTS,
  CONTENT_TITLE,
  CONTENT_DESCRIPTION,
  CORE_FOOTER,
} from '@/core/hooks/hooks';

/**
 * Tema hook'larını kaydet.
 * Server-side safe: DOM erişimi yok.
 */
export function registerThemeHooks(): void {
  // Content Filters
  HookRegistry.addFilter(CONTENT_TITLE, (title: string) => {
    return title;
  }, 10);

  HookRegistry.addFilter(CONTENT_DESCRIPTION, (description: string) => {
    return description;
  }, 10);

  // Template Hooks
  HookRegistry.addFilter(TEMPLATE_HEAD_ELEMENTS, (elements: any[]) => {
    return elements;
  }, 10);

  // Footer Action
  HookRegistry.addAction(CORE_FOOTER, () => {
    // Footer'da çalışacak kod
  }, 10);

  console.log('[DefaultTheme] Hooks registered successfully');
}

/**
 * Tema block'larını kaydet.
 */
export function registerThemeBlocks(): void {
  const blockTypes = [
    { typeKey: 'text_image',       path: '@/blocks/components/TextImageBlock' },
    { typeKey: 'iframe',           path: '@/blocks/components/IframeBlock' },
    { typeKey: 'component_ref',    path: '@/blocks/components/ComponentRefBlock' },
    { typeKey: 'page_ref',         path: '@/blocks/components/PageRefBlock' },
    { typeKey: 'faq_section',      path: '@/blocks/components/FaqBlock' },
    { typeKey: 'checkup',          path: '@/blocks/components/CheckupBlock' },
  ];

  for (const bt of blockTypes) {
    blockRegistry.register({
      typeKey: bt.typeKey,
      componentPath: bt.path,
      category: 'content',
      active: true,
    });
  }

  console.log(`[DefaultTheme] Registered ${blockTypes.length} blocks`);
}

/**
 * Tema varlıklarını kaydet (CSS, JS).
 * Not: 'default' teması globals.css'e dahildir, bu nedenle
 * theme.css sadece ek override'lar içerir.
 */
export function enqueueThemeAssets(): void {
  assetManager.enqueueStyle(
    'theme-default-main',
    '/themes/default/theme.css',
    [],
    'all',
    '1.0.0'
  );
}

/**
 * Tema devre dışı bırakıldığında hook kayıtlarını temizle.
 * Block temizliği index.ts uninstall() tarafından yapılır.
 */
export function unregisterThemeHooks(): void {
  HookRegistry.removeFilter(CONTENT_TITLE);
  HookRegistry.removeFilter(CONTENT_DESCRIPTION);
  HookRegistry.removeFilter(TEMPLATE_HEAD_ELEMENTS);
  HookRegistry.removeAction(CORE_FOOTER);

  console.log('[DefaultTheme] Hooks unregistered');
}
