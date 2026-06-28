import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/data';
import { getSiteUrl } from '@/core/utils/host';
import { getSitemapData } from '@/modules/seo/lib/sitemap-data';
import { M2_PRICE_PAGE_SLUG } from '@/modules/seo/lib/pseo-utils';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const baseUrl = await getSiteUrl();

  if (id === 'pages.xml') {
    const { pages: dbPages } = await getSitemapData();
    const staticEntries = [
      { url: baseUrl, lastModified: TODAY, changeFrequency: 'weekly', priority: 1 },
      { url: `${baseUrl}/iletisim`, lastModified: TODAY, changeFrequency: 'monthly', priority: 0.8 },
      { url: `${baseUrl}/hizmetler`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${baseUrl}/referanslar`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.8 },
    ];
    const staticUrls = new Set(staticEntries.map(e => e.url));
    const entries = [...staticEntries];

    for (const page of (dbPages as any[])) {
      const slug = page.slug?.startsWith('/') ? page.slug : `/${page.slug}`;
      const url = `${baseUrl}${slug === '/' ? '' : slug}`;
      if (staticUrls.has(url)) continue;
      entries.push({
        url,
        lastModified: page.updated_at ? new Date(page.updated_at).toISOString().split('T')[0] : TODAY,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
    return buildXml(entries);
  }

  if (id === 'hizmetler.xml') {
    const { services, categories } = await getSitemapData();
    const activeServices = (services as any[]).filter(s => s.active !== false);
    const activeCategories = (categories as any[]).filter(c => c.active !== false);
    const entries: any[] = [];

    for (const cat of activeCategories) {
      entries.push({
        url: `${baseUrl}/${cat.slug}`,
        lastModified: TODAY,
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }

    for (const srv of activeServices) {
      entries.push({
        url: `${baseUrl}/hizmetler/${srv.slug}`,
        lastModified: TODAY,
        changeFrequency: 'monthly',
        priority: 0.9,
      });
      entries.push({
        url: `${baseUrl}/hizmetler/${srv.slug}/hesaplama`,
        lastModified: TODAY,
        changeFrequency: 'monthly',
        priority: 0.9,
      });
    }
    return buildXml(entries);
  }

  if (id === 'referanslar.xml') {
    const { references } = await getSitemapData();
    const activeReferences = (references as any[]).filter(r => r.slug);
    const entries = activeReferences.map(ref => ({
      url: `${baseUrl}/referanslar/${ref.slug}`,
      lastModified: ref.updated_at ? new Date(ref.updated_at).toISOString().split('T')[0] : TODAY,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
    return buildXml(entries);
  }

  if (id === 'calculator.xml') {
    const settings = await getSettings().catch(() => null);
    const seoConfig = settings?.plugin_configs?.['service-calculator'] || {};
    const m2PagesEnabled = seoConfig.seo_enable_m2_price_page !== false;
    const { services } = await getSitemapData();
    const activeServices = (services as any[]).filter(s => s.active !== false);
    const entries: any[] = [];

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

  // Eski URL'lere gelen istekleri ana sitemap index'e yönlendiriyoruz.
  return NextResponse.redirect(new URL('/sitemap.xml', baseUrl), { status: 301 });
}
