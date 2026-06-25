/**
 * Merkezi kategori konfigürasyonu.
 * Renk haritaları ve yardımcı fonksiyonlar burada tanımlı —
 * ServicesSection, Navbar ve diğer bileşenler buradan import eder.
 */

const COLORS = [
  'blue-600',
  'teal-500',
  'amber-600',
  'indigo-600',
  'emerald-600',
  'rose-600',
  'violet-600',
  'cyan-600'
];

/** Kategori ID'sine göre Tailwind renk sınıfını döndürür */
export function getCategoryColor(slug: string): string {
  if (!slug) return 'blue-600';
  
  // Deterministic color based on slug string
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

/** Kategori etiketi — settings'den label yoksa slug'ı capitalize ederek döndürür */
function getCategoryLabel(
  slug: string,
  settings?: { uiContent?: { categoryPages?: Record<string, { badge?: string }> } } | null
): string {
  if (settings?.uiContent?.categoryPages?.[slug]?.badge) {
    return settings.uiContent.categoryPages[slug].badge!;
  }
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
