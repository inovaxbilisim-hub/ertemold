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
  const { references } = await getSitemapData();

  const activeReferences = (references as any[]).filter(r => r.slug);

  const entries = activeReferences.map(ref => ({
    url: `${baseUrl}/referanslar/${ref.slug}`,
    lastModified: ref.updated_at
      ? new Date(ref.updated_at).toISOString().split('T')[0]
      : TODAY,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return buildXml(entries);
}
