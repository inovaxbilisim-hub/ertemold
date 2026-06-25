import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PLUGIN_REGISTRY } from '@/plugins/_registry';
import { verifySession } from '@/core/auth/auth';
import { scanAvailableThemes, buildThemeConfig } from '@/core/registry/theme-server';
import { dbAll } from '@/core/database/db';

export async function GET(request: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type !== 'themes' && type !== 'plugins') {
    return NextResponse.json({ error: 'Invalid type. Use ?type=themes or ?type=plugins' }, { status: 400 });
  }

  if (type === 'plugins') {
    return handlePlugins();
  }

  if (type === 'themes') {
    return handleThemes();
  }
}

async function handlePlugins() {
  const extensions: any[] = [];

  // 1. Try filesystem first (works locally)
  const pluginsDir = path.join(process.cwd(), 'src', 'plugins');
  let fsLoaded = false;

  try {
    if (fs.existsSync(pluginsDir)) {
      const folders = fs.readdirSync(pluginsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const folder of folders) {
        if (folder.startsWith('_') || folder.startsWith('.')) continue;
        const jsonPath = path.join(pluginsDir, folder, 'plugin.json');
        if (fs.existsSync(jsonPath)) {
          try {
            const content = fs.readFileSync(jsonPath, 'utf8');
            const data = JSON.parse(content);
            extensions.push({ id: folder, ...data });
          } catch {
            extensions.push({ id: folder, name: folder, description: 'Hatalı JSON formatı', error: true });
          }
        } else {
          extensions.push({ id: folder, name: folder, description: 'Meta veri dosyası bulunamadı.' });
        }
      }
      fsLoaded = extensions.length > 0;
    }
  } catch (fsError) {
    console.warn('[Extensions] Filesystem scan failed, falling back to registry:', fsError);
  }

  // 2. Fallback: Use static PLUGIN_REGISTRY
  if (!fsLoaded) {
    for (const plugin of PLUGIN_REGISTRY) {
      extensions.push({
        id: plugin.name,
        name: plugin.name
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        description: plugin.description,
        version: '1.0.0',
        author: 'Antigravity',
        priority: plugin.priority,
        preset: plugin.preset,
        hooks: plugin.hooks,
      });
    }
  }

  return NextResponse.json(extensions);
}

async function handleThemes() {
  // 1. Filesystem keşfi (tema klasörlerini tara)
  const fsThemes = scanAvailableThemes();

  // 2. DB'den tema kayıtlarını çek (aktif/pasif durumu ve ayarlar)
  const dbThemes = await dbAll('SELECT * FROM themes');

  // 3. Aktif temayı themes tablosundan al (single source of truth)
  let activeThemeSlug = 'default';
  try {
    const { dbGet } = await import('@/core/database/db');
    const activeRow = await dbGet<{ slug: string }>(
      'SELECT slug FROM themes WHERE active = true LIMIT 1'
    );
    activeThemeSlug = activeRow?.slug || 'default';
  } catch {
    // Tablo henüz yoksa default'a düş
    activeThemeSlug = 'default';
  }

  // 4. DB theme map (slug -> row)
  const dbThemeMap: Record<string, any> = {};
  for (const row of dbThemes as Record<string, any>[]) {
    const slug = row.slug || row.id;
    dbThemeMap[slug] = row;
  }

  // 5. FS'deki temaları DB bilgileriyle zenginleştir
  const merged: any[] = [];
  for (const manifest of fsThemes) {
    const dbRow = dbThemeMap[manifest.slug];
    const config = buildThemeConfig(
      manifest.slug,
      manifest,
      dbRow?.settings ? (typeof dbRow.settings === 'string' ? JSON.parse(dbRow.settings) : dbRow.settings) : null,
      activeThemeSlug === manifest.slug,
    );

    merged.push({
      id: config.slug,
      name: config.name,
      description: config.description,
      author: config.author,
      version: config.version,
      active: config.active,
      isSystem: config.isSystem,
      settings: config.settings,
      screenshot: manifest.screenshot || '',
      settingsSchema: manifest.settingsSchema || null,
    });
  }

  // 6. Varsayılan tema her zaman listenin başında olsun
  const defaultIdx = merged.findIndex(t => t.id === 'default');
  if (defaultIdx > 0) {
    const [item] = merged.splice(defaultIdx, 1);
    merged.unshift(item);
  }

  return NextResponse.json(merged);
}
