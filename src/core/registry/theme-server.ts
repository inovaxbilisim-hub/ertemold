'server-only';

/**
 * theme-server.ts — Server-only tema yardımcıları.
 * DB erişimi, filesystem tarama ve manifest okuma burada.
 * Client component'lardan ASLA import edilmemeli.
 *
 * Client-safe fonksiyonlar için: @/core/registry/theme
 */

import type { ThemeManifest, ThemeConfig } from '@/core/types/theme';
import { THEME_REGISTRY } from './theme';

// ---------------------------------------------------------------------------
// DB — Aktif Tema
// ---------------------------------------------------------------------------

/**
 * Aktif temayı doğrudan veritabanından al (single source of truth).
 * Server Component ve server action'lardan çağrılmalı.
 */
export async function getActiveThemeFromDB(): Promise<string> {
  const { dbGet } = await import('@/core/database/db');
  const result = await dbGet<{ slug: string }>(
    'SELECT slug FROM themes WHERE active = true LIMIT 1'
  );
  return result?.slug || 'default';
}

// ---------------------------------------------------------------------------
// FILESYSTEM — Tema Keşif (Serverless fallback ile)
// ---------------------------------------------------------------------------

/**
 * src/themes/ dizinini tarar, tüm tema manifest'lerini döndürür.
 * Serverless ortamlarda (Vercel) THEME_REGISTRY'ye fallback yapar.
 */
export function scanAvailableThemes(): ThemeManifest[] {
  let fs: any;
  let path: any;

  try {
    fs = require('fs');
    path = require('path');
  } catch {
    return Object.keys(THEME_REGISTRY).map((slug) => ({
      slug, name: slug, description: '', author: '', version: '0.0.0',
    }));
  }

  const themes: ThemeManifest[] = [];
  const themesDir = path.join(process.cwd(), 'src', 'themes');

  try {
    if (fs.existsSync(themesDir)) {
      const folders: string[] = fs
        .readdirSync(themesDir, { withFileTypes: true })
        .filter((d: any) => d.isDirectory())
        .map((d: any) => d.name);

      for (const folder of folders) {
        const jsonPath = path.join(themesDir, folder, 'theme.json');
        if (fs.existsSync(jsonPath)) {
          try {
            const content = fs.readFileSync(jsonPath, 'utf-8');
            const manifest = JSON.parse(content) as ThemeManifest;
            manifest.slug = manifest.slug || folder;
            themes.push(manifest);
          } catch {
            themes.push({ slug: folder, name: folder, description: 'Hatalı theme.json', author: '—', version: '0.0.0' });
          }
        } else {
          themes.push({ slug: folder, name: folder, description: 'theme.json bulunamadı', author: '—', version: '0.0.0' });
        }
      }
    }
  } catch (error) {
    console.warn('[ThemeRegistry] Filesystem scan failed, using static registry:', error);
    return Object.keys(THEME_REGISTRY).map((slug) => ({
      slug, name: slug, description: '', author: '', version: '0.0.0',
    }));
  }

  return themes;
}

/**
 * Belirli bir temanın manifest dosyasını filesystem'den okur.
 */
function getThemeManifest(slug: string): ThemeManifest | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(process.cwd(), 'src', 'themes', slug, 'theme.json');
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as ThemeManifest;
    }
  } catch {
    console.warn(`[ThemeRegistry] Failed to read manifest for theme: ${slug}`);
  }
  return null;
}

/**
 * Bir temanın CSS dosyasını okur.
 */
export function getThemeCSS(slug: string): string {
  try {
    const fs = require('fs');
    const path = require('path');
    const cssPath = path.join(process.cwd(), 'src', 'themes', slug, 'theme.css');
    if (fs.existsSync(cssPath)) return fs.readFileSync(cssPath, 'utf-8');
  } catch {
    // CSS olmayan tema olabilir
  }
  return '';
}

// ---------------------------------------------------------------------------
// THEME CONFIG
// ---------------------------------------------------------------------------

/**
 * Tema manifest + DB ayarlarından ThemeConfig üretir.
 */
export function buildThemeConfig(
  slug: string,
  manifest: ThemeManifest | null,
  dbSettings: Record<string, any> | null,
  isActive: boolean,
): ThemeConfig {
  return {
    slug,
    name: manifest?.name || slug,
    description: manifest?.description || '',
    author: manifest?.author || '—',
    version: manifest?.version || '0.0.0',
    parent: manifest?.parent ?? undefined,
    active: isActive,
    isSystem: slug === 'default',
    settings: dbSettings || {},
    manifest,
  };
}

// ---------------------------------------------------------------------------
// CHILD THEME — Hiyerarşi Yükleme
// ---------------------------------------------------------------------------

/**
 * Parent → Child sırasıyla tema modüllerini yükler.
 */
async function loadThemeHierarchy(slug: string): Promise<void> {
  const manifest = getThemeManifest(slug);
  if (!manifest) {
    console.warn(`[ThemeRegistry] Theme ${slug} not found`);
    return;
  }

  if (manifest.parent) {
    try {
      const parentModule = await THEME_REGISTRY[manifest.parent]?.();
      if (parentModule?.register) {
        parentModule.register();
        console.log(`[ThemeRegistry] Loaded parent theme: ${manifest.parent}`);
      }
    } catch (error) {
      console.error(`[ThemeRegistry] Failed to load parent theme: ${manifest.parent}`, error);
    }
  }

  try {
    const childModule = await THEME_REGISTRY[slug]?.();
    if (childModule?.register) {
      childModule.register();
      console.log(`[ThemeRegistry] Loaded child theme: ${slug}`);
    }
  } catch (error) {
    console.error(`[ThemeRegistry] Failed to load child theme: ${slug}`, error);
  }
}
