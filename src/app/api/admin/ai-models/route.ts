import { NextResponse } from 'next/server';
import { dbGet } from '@/core/database/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider || (provider !== 'gemini' && provider !== 'openrouter')) {
      return NextResponse.json({ error: 'Geçersiz provider' }, { status: 400 });
    }

    const settings = await dbGet<Record<string, unknown>>('SELECT gemini_api_key, openrouter_api_key FROM site_settings LIMIT 1');
    if (!settings) {
      return NextResponse.json({ error: 'Ayarlar bulunamadı' }, { status: 404 });
    }

    if (provider === 'gemini') {
      const apiKey = String(settings.gemini_api_key || '').trim();
      if (!apiKey) {
        return NextResponse.json({ models: [] });
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!res.ok) {
        throw new Error('Gemini API hatası');
      }
      const data = await res.json();
      return NextResponse.json(data);
    } else {
      const apiKey = String(settings.openrouter_api_key || '').trim();
      if (!apiKey) {
        return NextResponse.json({ data: [] });
      }

      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (!res.ok) {
        throw new Error('OpenRouter API hatası');
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

  } catch (error: any) {
    console.error('[ai-models] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
