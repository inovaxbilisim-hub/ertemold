import { NextResponse } from 'next/server';

import { getSiteUrl } from '@/core/utils/host';
import { getSitemapData } from '@/modules/seo/lib/sitemap-data';

export const revalidate = 86400;

const TODAY = new Date().toISOString().split('T')[0];

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
  const baseUrl = await getSiteUrl();
  const { services, categories } = await getSitemapData();

  const activeServices = (services as any[]).filter(s => s.active !== false);
  const activeCategories = (categories as any[]).filter(c => c.active !== false);

  const entries: { url: string; lastModified?: string; changeFrequency?: string; priority?: number }[] = [];

  // Kategori sayfaları
  for (const cat of activeCategories) {
    entries.push({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: TODAY,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  }

  // Hizmet detay sayfaları + hesaplama sayfaları
  for (const srv of activeServices) {
    entries.push({
      url: `${baseUrl}/hizmetler/${srv.slug}`,
      lastModified: TODAY,
      changeFrequency: 'monthly',
      priority: 0.9,
    });

    // Her aktif hizmet için ayrı hesaplama sayfası (plugin kapalıysa bile bilgilendirici sayfa çıkar)
    entries.push({
      url: `${baseUrl}/hizmetler/${srv.slug}/hesaplama`,
      lastModified: TODAY,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  }

  return buildXml(entries);
}
