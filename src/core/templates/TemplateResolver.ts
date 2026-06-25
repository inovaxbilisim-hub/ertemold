/**
 * TemplateResolver - WordPress benzeri template override sistemi
 * Temalar core component'leri override edebilir.
 *
 * Turbopack uyumlu: Tüm import() çağrıları statik string literal kullanır.
 * Yeni template eklendiğinde CORE_TEMPLATE_LOADERS ve THEME_TEMPLATE_LOADERS güncellenmeli.
 */

import { cache } from 'react';
import React from 'react';

// ---------------------------------------------------------------------------
// STATIC FALLBACK (CORE) TEMPLATE LOADERS
// Turbopack: import() içinde değişken kullanılamaz → statik map zorunlu.
// ---------------------------------------------------------------------------
const CORE_TEMPLATE_LOADERS: Record<string, () => Promise<any>> = {
  'shared/layout/Navbar':           () => import('@/shared/layout/Navbar'),
  'shared/layout/Footer':           () => import('@/shared/layout/Footer'),
  'shared/layout/AnnouncementBar':  () => import('@/shared/layout/AnnouncementBar'),
};

// ---------------------------------------------------------------------------
// STATIC THEME TEMPLATE LOADERS
// Tema override'ları için: { 'themeSlug:TemplateName': loader }
// Yeni tema template eklenince buraya eklenmeli.
// Örn: 'my-theme:Navbar': () => import('@/themes/my-theme/templates/Navbar'),
// ---------------------------------------------------------------------------
const THEME_TEMPLATE_LOADERS: Record<string, () => Promise<any>> = {
  // 'example-child:Navbar': () => import('@/themes/example-child/templates/Navbar'),
};

// In-memory cache (server process boyunca yaşar)
interface TemplateCache {
  [key: string]: React.ComponentType<any> | null;
}
const templateCache: TemplateCache = {};

/**
 * Tema template'ini resolve eder.
 * 1. Önce tema override'ına bakar (THEME_TEMPLATE_LOADERS)
 * 2. Bulamazsa core fallback'e geçer (CORE_TEMPLATE_LOADERS)
 *
 * @param templateName - Template adı ('Navbar', 'Footer', vb.)
 * @param activeTheme  - Aktif tema slug'ı
 * @param fallbackPath - Core template yolu ('shared/layout/Navbar' vb.)
 */
export async function resolveTemplate<T = any>(
  templateName: string,
  activeTheme: string,
  fallbackPath?: string,
): Promise<React.ComponentType<T> | null> {
  const cacheKey = `${activeTheme}:${templateName}`;

  if (templateCache[cacheKey] !== undefined) {
    return templateCache[cacheKey] as React.ComponentType<T> | null;
  }

  // 1. Tema override dene
  if (activeTheme && activeTheme !== 'default') {
    const themeLoader = THEME_TEMPLATE_LOADERS[`${activeTheme}:${templateName}`];
    if (themeLoader) {
      try {
        const mod = await themeLoader();
        const component = mod.default ?? null;
        templateCache[cacheKey] = component;
        console.log(`[TemplateResolver] Theme override: ${activeTheme}/${templateName}`);
        return component as React.ComponentType<T>;
      } catch (err) {
        console.warn(`[TemplateResolver] Theme loader failed: ${activeTheme}:${templateName}`, err);
      }
    }
  }

  // 2. Core fallback
  if (fallbackPath) {
    const coreLoader = CORE_TEMPLATE_LOADERS[fallbackPath];
    if (coreLoader) {
      try {
        const mod = await coreLoader();
        const component = mod.default ?? null;
        templateCache[cacheKey] = component;
        return component as React.ComponentType<T>;
      } catch (err) {
        console.error(`[TemplateResolver] Core loader failed: ${fallbackPath}`, err);
      }
    } else {
      console.warn(`[TemplateResolver] No static loader for fallback: "${fallbackPath}". Add it to CORE_TEMPLATE_LOADERS.`);
    }
  }

  templateCache[cacheKey] = null;
  return null;
}

/**
 * Template cache'i temizle (HMR veya tema değişikliği için).
 */
function clearTemplateCache(themeSlug?: string): void {
  if (themeSlug) {
    Object.keys(templateCache)
      .filter(key => key.startsWith(`${themeSlug}:`))
      .forEach(key => delete templateCache[key]);
  } else {
    Object.keys(templateCache).forEach(key => delete templateCache[key]);
  }
}

/**
 * React cache() ile sarılmış resolver (Server Component'lerde memoize).
 */
const cachedResolveTemplate = cache(resolveTemplate);
