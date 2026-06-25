/**
 * ServiceForm paylaşımlı yardımcı fonksiyonlar.
 * Türkçe slug dönüşümü ve sektör eşleştirme.
 */

/** Metni URL-uyumlu slug'a çevirir (Türkçe karakter desteğiyle) */
export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ş': 's', 'ü': 'u', 'ı': 'i', 'ö': 'o',
    'Ç': 'C', 'Ğ': 'G', 'Ş': 'S', 'Ü': 'U', 'İ': 'I', 'Ö': 'O',
  };
  let result = text;
  for (const key in trMap) {
    result = result.replace(new RegExp(key, 'g'), trMap[key]);
  }
  return result
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Verilen sektör değerini (ad veya slug) mevcut sektörler listesinde arar
 * ve canonical slug döndürür. Bulamazsa boş string.
 */
export function resolveSectorSlug(value: string, sectors: any[]): string {
  const raw = String(value || '').trim();
  if (!raw) return '';

  // 1. Exact slug match
  const bySlug = sectors.find((s: any) => s.slug === raw);
  if (bySlug) return bySlug.slug;

  // 2. Case-insensitive slug match
  const normalized = raw.toLowerCase();
  const byNormalizedSlug = sectors.find((s: any) => String(s.slug || '').toLowerCase() === normalized);
  if (byNormalizedSlug) return byNormalizedSlug.slug;

  // 3. Name match
  const byName = sectors.find((s: any) => String(s.name || '').trim().toLowerCase() === normalized);
  if (byName) return byName.slug;

  // 4. Slugified name match
  const slugified = slugify(raw);
  const bySlugifiedName = sectors.find((s: any) => slugify(String(s.name || '')) === slugified);
  if (bySlugifiedName) return bySlugifiedName.slug;

  const bySlugifiedSlug = sectors.find((s: any) => slugify(String(s.slug || '')) === slugified);
  if (bySlugifiedSlug) return bySlugifiedSlug.slug;

  return '';
}

/** API yanıtını güvenli şekilde JSON'a parse eder */
export async function readJsonResponse(res: Response): Promise<any> {
  const raw = await res.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return {
      success: false,
      error: raw.trim() || `HTTP ${res.status}`,
      raw,
    };
  }
}
