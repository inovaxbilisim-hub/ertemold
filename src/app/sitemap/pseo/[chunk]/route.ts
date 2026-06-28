import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/data';
import { getSiteUrl } from '@/core/utils/host';
import { getSitemapData } from '@/modules/seo/lib/sitemap-data';
export const revalidate = 86400;

const TODAY = new Date().toISOString().split('T')[0];

// Arama hacmi yüksek büyük şehirler — daha yüksek crawl priority
const MAJOR_CITIES = new Set([
  'istanbul', 'ankara', 'izmir', 'bursa', 'antalya',
  'adana', 'gaziantep', 'konya', 'kocaeli', 'mersin',
  'diyarbakir', 'samsun', 'eskisehir', 'denizli', 'sanliurfa',
]);

function buildXml(entries: { url: string; lastModified?: string; changeFrequency?: string; priority?: number }[]): NextResponse {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const e of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${e.url}</loc>\n`;
    if (e.lastModified) xml += `    <lastmod>${e.lastModified}</lastmod>\n`;
    if (e.changeFrequency) xml += `    <changefreq>${e.changeFrequency}</changefreq>\n`;
    if (e.priority !== undefined) xml += `    <priority>${e.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>`;
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chunk: string }> }
) {
  const resolvedParams = await params;
  const chunkId = parseInt(resolvedParams.chunk.replace('.xml', ''), 10) || 0;

  const settings = await getSettings().catch(() => null);
  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : await getSiteUrl();
  const CHUNK_SIZE = settings?.sitemapChunkSize !== undefined && settings.sitemapChunkSize > 0
    ? settings.sitemapChunkSize
    : 50000;

  const { services, cities: allCities } = await getSitemapData();
  const activeServices = (services as any[]).filter(s => s.active !== false);

  const start = chunkId * CHUNK_SIZE;
  const end = start + CHUNK_SIZE;

  const entries: { url: string; lastModified?: string; changeFrequency?: string; priority?: number }[] = [];
  let idx = 0;

  outer:
  for (const srv of activeServices) {
    for (const city of (allCities as any[])) {
      const citySlug = city.slug;
      const isMajorCity = MAJOR_CITIES.has(citySlug);

      // İl bazlı pSEO
      if (idx >= start && idx < end) {
        entries.push({
          url: `${baseUrl}/hizmetler/${srv.slug}/${citySlug}`,
          lastModified: TODAY,
          changeFrequency: 'monthly',
          priority: isMajorCity ? 0.8 : 0.7,
        });
      }
      idx++;
      if (idx >= end) break outer;
    }
  }

  return buildXml(entries);
}
