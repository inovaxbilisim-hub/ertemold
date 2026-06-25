import { NextResponse } from 'next/server';

/**
 * @deprecated
 * Bu route artık kullanılmıyor.
 * Sitemap yapısı semantik alt sitemaplara taşındı:
 *   /sitemap/pages.xml
 *   /sitemap/hizmetler.xml
 *   /sitemap/referanslar.xml
 *   /sitemap/pseo/{chunk}.xml
 *
 * Eski URL'lere gelen istekleri ana sitemap index'e yönlendiriyoruz.
 */
export async function GET() {
  return NextResponse.redirect('/sitemap.xml', { status: 301 });
}
