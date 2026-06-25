import { NextResponse } from 'next/server';
import { verifySession } from '@/core/auth/auth';
import { dbRun, dbGet } from '@/core/database/db';

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { slug, settings } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Geçersiz tema slug\'ı' }, { status: 400 });
    }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Geçersiz tema ayarları' }, { status: 400 });
    }

    // 1. themes tablosunda güncelle (upsert)
    await dbRun(
      `INSERT INTO themes (slug, name, settings, updated_at)
       VALUES ($1, $1, $2, NOW())
       ON CONFLICT (slug) DO UPDATE SET settings = $2, updated_at = NOW()`,
      [slug, JSON.stringify(settings)],
    );

    // 2. Ayrıca settings'in uiContent'ine de kaydet (layout.tsx'in okuyabilmesi için)
    const settingsRow = await dbGet<Record<string, any>>('SELECT * FROM site_settings LIMIT 1');
    if (settingsRow) {
      let uiContent: Record<string, any> = {};
      if (typeof settingsRow.ui_content === 'string') {
        try { uiContent = JSON.parse(settingsRow.ui_content); } catch { uiContent = {}; }
      } else if (settingsRow.ui_content) {
        uiContent = settingsRow.ui_content as Record<string, any>;
      }

      uiContent.theme_settings = {
        ...(uiContent.theme_settings || {}),
        [slug]: settings,
      };

      await dbRun(
        'UPDATE site_settings SET ui_content = $1 WHERE id = $2',
        [JSON.stringify(uiContent), settingsRow.id],
      );
    }

    return NextResponse.json({
      success: true,
      message: `"${slug}" tema ayarları kaydedildi.`,
    });
  } catch (error) {
    console.error('[ThemeSettings] Error:', error);
    return NextResponse.json({ error: 'Tema ayarları kaydedilirken hata oluştu' }, { status: 500 });
  }
}
