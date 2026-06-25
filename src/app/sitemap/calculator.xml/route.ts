import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/data';
import { getSiteUrl } from '@/core/utils/host';
import { getSitemapData } from '@/modules/seo/lib/sitemap-data';
import { M2_PRICE_PAGE_SLUG } from '@/modules/seo/lib/pseo-utils';
export const revalidate = 86400;

const TODAY = new Date().toISOString().split('T')[0];
// const MAJOR_CITIES = new Set([
//   'istanbul', 'ankara', 'izmir', 'bursa', 'antalya',
//   'adana', 'gaziantep', 'konya', 'kocaeli', 'mersin',
//   'diyarbakir', 'samsun', 'eskisehir', 'denizli', 'sanliurfa',
// ]);

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

export async function GET() {
  const settings = await getSettings().catch(() => null);
  const baseUrl = await getSiteUrl();

  const seoConfig = settings?.plugin_configs?.['service-calculator'] || {};
  const m2PagesEnabled = seoConfig.seo_enable_m2_price_page !== false;
  const { services } = await getSitemapData();
  const activeServices = (services as any[]).filter(s => s.active !== false);

  const entries: { url: string; lastModified?: string; changeFrequency?: string; priority?: number }[] = [];

  if (m2PagesEnabled) {
    for (const srv of activeServices) {
      entries.push({
        url: `${baseUrl}/hizmetler/${srv.slug}/${M2_PRICE_PAGE_SLUG}`,
        lastModified: TODAY,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return buildXml(entries);
}
