let cachedUrl: any = null;

/**
 * Site URL'ini veritabanından veya çevre değişkenlerinden çözümler.
 * SiteSettings objesi veya string (path/url) veya undefined kabul eder.
 * SiteSettings geçilirse sadece DB/env'den çeker — settings.siteUrl kullanmaz (her zaman fresh URL).
 */
export async function getSiteUrl(_pathOrSettings?: string | null | { siteUrl?: string; [key: string]: any }): Promise<string> {
  if (cachedUrl) return cachedUrl;

  try {
    const { dbGet } = await import('@/core/database/db');
    const row = await dbGet<any>('SELECT option_value FROM system_options WHERE option_name = \'site_url\' LIMIT 1');
    if (row && row.option_value) {
      cachedUrl = String(row.option_value).replace(/\/+$/, '');
      return cachedUrl;
    }
  } catch {
    // fallback
  }

  try {
    const { dbGet } = await import('@/core/database/db');
    const row = await dbGet<any>('SELECT site_url FROM site_settings LIMIT 1');
    if (row && row.site_url) {
      cachedUrl = String(row.site_url).replace(/\/+$/, '');
      return cachedUrl;
    }
  } catch {
    // fallback
  }

  cachedUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return cachedUrl;
}

/**
 * Verilen yol için tam canonical URL oluşturur.
 */
async function getCanonicalUrl(path: string): Promise<string> {
  const base = await getSiteUrl();
  return base + (path.startsWith('/') ? path : '/' + path);
}

/**
 * Statik olarak önbelleğe alınmış site URL'ini döner.
 */
function getStaticSiteUrl(): string {
  return cachedUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}
