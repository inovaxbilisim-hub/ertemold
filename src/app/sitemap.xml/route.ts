import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/data';
import { getSiteUrl } from '@/core/utils/host';
import { getPotentialPseoCount } from '@/modules/seo/lib/pseo-utils';

export async function GET() {
  const settings = await getSettings().catch(() => null);
  const baseUrl = await getSiteUrl();

  const CHUNK_SIZE = settings?.sitemapChunkSize !== undefined && settings.sitemapChunkSize > 0
    ? settings.sitemapChunkSize
    : 50000;

  // pSEO chunk sayısını hesapla
  let pseoCount = 0;
  try {
    pseoCount = await getPotentialPseoCount();
  } catch (e) {
    console.warn('[sitemap.xml] pseo count error', e);
  }
  const pseoChunkCount = Math.ceil(pseoCount / CHUNK_SIZE) || 1;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Statik sayfalar
  xml += `  <sitemap><loc>${baseUrl}/sitemap/pages.xml</loc></sitemap>\n`;
  // Hizmetler
  xml += `  <sitemap><loc>${baseUrl}/sitemap/hizmetler.xml</loc></sitemap>\n`;
  // Referanslar
  xml += `  <sitemap><loc>${baseUrl}/sitemap/referanslar.xml</loc></sitemap>\n`;
  // Calculator / m² fiyat sayfaları
  xml += `  <sitemap><loc>${baseUrl}/sitemap/calculator.xml</loc></sitemap>\n`;
  // pSEO chunks
  for (let i = 0; i < pseoChunkCount; i++) {
    xml += `  <sitemap><loc>${baseUrl}/sitemap/pseo/${i}.xml</loc></sitemap>\n`;
  }

  xml += `</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}