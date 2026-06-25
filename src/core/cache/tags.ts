/**
 * Merkezi cache tag listesi.
 * unstable_cache ve revalidateTag çağrılarında bu sabitleri kullan.
 * Yanlış yazım / typo ile farklı tag oluşmasını önler.
 */

export const CACHE_TAGS = {
  // Content
  SERVICES: "services",
  SERVICE_CATEGORIES: "service-categories",
  REFERENCES: "references",
  HERO: "hero",
  STATS: "stats",
  FAQS: "faqs",
  LEGAL: "legal",
  PAGES: "pages",

  // Locations
  LOCATIONS: "locations",
  BRANCHES: "branches",

  // Settings
  SETTINGS: "settings",
  SECTORS: "sectors",
  SEO: "seo",

  // Meta
  SITEMAP_DATA: "sitemap-data",

  // pSEO
  PSEO_PAGES: "pseo-pages",
  PSEO_CONTENT: "pseo-content",

  // AEO
  AEO_SCHEMA: "aeo-schema",

  // Knowledge Graph
  KNOWLEDGE_GRAPH: "knowledge-graph",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Sitemap'i etkileyen tag'ler.
 * Bir mutation bu tag'lerden birini etkiliyorsa sitemap-data cache'i de temizlenmeli.
 */
const SITEMAP_AFFECTING_TAGS: readonly CacheTag[] = [
  CACHE_TAGS.SERVICES,
  CACHE_TAGS.SERVICE_CATEGORIES,
  CACHE_TAGS.PAGES,
  CACHE_TAGS.SECTORS,
  CACHE_TAGS.REFERENCES,
] as const;
