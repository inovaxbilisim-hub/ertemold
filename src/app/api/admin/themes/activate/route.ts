import { NextResponse } from 'next/server';
import { verifySession } from '@/core/auth/auth';
import { dbRun, dbGet, dbExec } from '@/core/database/db';
import { getThemeCSS } from '@/core/registry/theme-server';

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Geçersiz tema slug\'ı' }, { status: 400 });
    }

    // 1. Mevcut settings'i al
    const settingsRow = await dbGet<Record<string, any>>('SELECT * FROM site_settings LIMIT 1');
    if (!settingsRow) {
      return NextResponse.json({ error: 'Site ayarları bulunamadı' }, { status: 404 });
    }

    // 2. uiContent JSON'ını parse et
    let uiContent: Record<string, any> = {};
    if (typeof settingsRow.ui_content === 'string') {
      try { uiContent = JSON.parse(settingsRow.ui_content); } catch { uiContent = {}; }
    } else if (settingsRow.ui_content) {
      uiContent = settingsRow.ui_content as Record<string, any>;
    }

    // 3. Yeni temayı aktif et
    uiContent.active_theme = slug;

    // 4. DB'yi güncelle
    await dbRun(
      'UPDATE site_settings SET ui_content = $1 WHERE id = $2',
      [JSON.stringify(uiContent), settingsRow.id],
    );

    // 5. themes tablosunu güncelle
    // Önce tüm temaları pasif yap
    await dbExec('UPDATE themes SET active = false');
    // Sonra seçileni aktif yap (upsert)
    await dbRun(
      `INSERT INTO themes (slug, name, active, is_system, updated_at)
       VALUES ($1, $1, true, $2, NOW())
       ON CONFLICT (slug) DO UPDATE SET active = true, updated_at = NOW()`,
      [slug, slug === 'default'],
    );

    // 6. Tema CSS'ini serve et (opsiyonel — önbellek ısıtma)
    const css = slug !== 'default' ? getThemeCSS(slug) : '';

    return NextResponse.json({
      success: true,
      activeTheme: slug,
      hasCSS: !!css,
      message: `Tema "${slug}" aktif edildi.`,
    });
  } catch (error) {
    console.error('[ThemeActivate] Error:', error);
    return NextResponse.json({ error: 'Tema aktifleştirilirken hata oluştu' }, { status: 500 });
  }
}
