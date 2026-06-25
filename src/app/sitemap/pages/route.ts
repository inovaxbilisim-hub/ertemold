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
  const { pages: dbPages } = await getSitemapData();

  const entries: { url: string; lastModified?: string; changeFrequency?: string; priority?: number }[] = [
    { url: baseUrl, lastModified: TODAY, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/iletisim`, lastModified: TODAY, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/hizmetler`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/referanslar`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.8 },
  ];

  // DB'den dinamik sayfalar (SSS, kurumsal vb.)
  for (const page of (dbPages as any[])) {
    const slug = page.slug?.startsWith('/') ? page.slug : `/${page.slug}`;
    entries.push({
      url: `${baseUrl}${slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at).toISOString().split('T')[0] : TODAY,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return buildXml(entries);
}
