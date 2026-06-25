/**
 * Hook Kataloğu — ERTEM hook sisteminin tek kaynağı (single source of truth).
 *
 * Tüm hook isimleri, tipleri, parametreleri ve dönüş değerleri burada tanımlıdır.
 * Kategorilere ayrılmıştır: DATA, CONTENT, SEO, AEO, TEMPLATE, CACHE
 */

import type { HookDefinition } from './types';

// ---------------------------------------------------------------------------
// DATA HOOKS
// ---------------------------------------------------------------------------

/**
 * pseo:resolve-params — pSEO parametrelerini çözümler.
 * Fires when: pSEO sayfası render edilirken URL'den parametreler çözümlendiğinde
 * Returns: Çözümlenmiş PseoParams
 */
const PSEO_RESOLVE_PARAMS = 'pseo:resolve-params';

/**
 * pseo:get-service — Servis verisini değiştirir.
 * Fires when: Servis DB'den çekildikten sonra
 * Returns: Modify edilmiş Service objesi
 */
const PSEO_GET_SERVICE = 'pseo:get-service';

/**
 * pseo:get-location — Lokasyon verisini değiştirir.
 * Fires when: Lokasyon DB'den çekildikten sonra
 * Returns: Modify edilmiş PseoLocation
 */
const PSEO_GET_LOCATION = 'pseo:get-location';

// ---------------------------------------------------------------------------
// CONTENT HOOKS
// ---------------------------------------------------------------------------

/**
 * pseo:content-intro — pSEO intro metnini değiştirir.
 * Fires when: pSEO içerik üretilirken intro varyantı seçildikten sonra
 * Returns: Modify edilmiş intro string
 */
const PSEO_CONTENT_INTRO = 'pseo:content-intro';

/**
 * pseo:content-process — pSEO süreç adımlarını değiştirir.
 * Fires when: pSEO içerik üretilirken süreç adımları oluşturulduktan sonra
 * Returns: Modify edilmiş process string array
 */
const PSEO_CONTENT_PROCESS = 'pseo:content-process';

/**
 * pseo:content-benefit — pSEO fayda maddelerini değiştirir.
 * Fires when: pSEO içerik üretilirken faydalar oluşturulduktan sonra
 * Returns: Modify edilmiş benefit string array
 */
const PSEO_CONTENT_BENEFIT = 'pseo:content-benefit';

/**
 * pseo:content-title — pSEO sayfa başlığını değiştirir.
 * Fires when: pSEO meta title oluşturulduktan sonra
 * Returns: Modify edilmiş title string
 */
const PSEO_CONTENT_TITLE = 'pseo:content-title';

/**
 * pseo:content-description — pSEO meta description'ı değiştirir.
 * Fires when: pSEO meta description oluşturulduktan sonra
 * Returns: Modify edilmiş description string
 */
const PSEO_CONTENT_DESCRIPTION = 'pseo:content-description';

/**
 * content:inject-section — Template'lere yeni section enjekte eder.
 * Fires when: Template render edilirken section listesi oluşturulduğunda
 * Returns: Modify edilmiş sections object
 */
export const CONTENT_INJECT_SECTION = 'content:inject-section';

/**
 * content:before-render — Template render olmadan hemen önce tetiklenir.
 * Fires when: Template render başlamadan hemen önce
 * Returns: void (side effect only)
 */
export const CONTENT_BEFORE_RENDER = 'content:before-render';

/**
 * content:after-render — Template render tamamlandıktan sonra tetiklenir.
 * Returns: void (side effect only)
 */
const CONTENT_AFTER_RENDER = 'content:after-render';

/**
 * content:title — Sayfa başlığını filtreler.
 * Fires when: Başlık render öncesi
 * Returns: Modify edilmiş title string
 */
export const CONTENT_TITLE = 'content:title';

/**
 * content:description — Sayfa açıklamasını filtreler.
 * Fires when: Açıklama render öncesi
 * Returns: Modify edilmiş description string
 */
export const CONTENT_DESCRIPTION = 'content:description';

// ---------------------------------------------------------------------------
// SEO HOOKS
// ---------------------------------------------------------------------------

/**
 * seo:generate-meta — SEO meta verisini değiştirir.
 * Fires when: SEO meta (title, description, canonical, etc.) üretildikten sonra
 * Returns: Modify edilmiş SeoMeta objesi
 */
const SEO_GENERATE_META = 'seo:generate-meta';

/**
 * seo:build-schema — JSON-LD schema objesini değiştirir.
 * Fires when: Sayfa için schema.org JSON-LD oluşturulduktan sonra
 * Returns: Modify edilmiş schema object
 */
const SEO_BUILD_SCHEMA = 'seo:build-schema';

/**
 * seo:build-global-schema — Global schema (Organization, etc.) objesini değiştirir.
 * Fires when: Global schema JSON-LD oluşturulduktan sonra
 * Returns: Modify edilmiş global schema object
 */
const SEO_BUILD_GLOBAL_SCHEMA = 'seo:build-global-schema';

// ---------------------------------------------------------------------------
// AEO HOOKS
// ---------------------------------------------------------------------------

/**
 * aeo:build-speakable — Speakable schema içeriğini değiştirir.
 * Fires when: Speakable schema oluşturulurken
 * Returns: Modify edilmiş SpeakableResult
 */
const AEO_BUILD_SPEAKABLE = 'aeo:build-speakable';

/**
 * aeo:extract-entities — Çıkarılan entity listesini değiştirir.
 * Fires when: İçerikten entity'ler çıkarıldıktan sonra
 * Returns: Modify edilmiş entity list
 */
const AEO_EXTRACT_ENTITIES = 'aeo:extract-entities';

/**
 * aeo:optimize-faq — FAQ'ları AEO-optimize eder.
 * Fires when: FAQ'lar optimize edilirken
 * Returns: Modify edilmiş FaqResult
 */
const AEO_OPTIMIZE_FAQ = 'aeo:optimize-faq';

/**
 * aeo:build-summary — AI Overviews/SGE için özet bloğu değiştirir.
 * Fires when: AEO summary bloğu oluşturulurken
 * Returns: Modify edilmiş summary string
 */
const AEO_BUILD_SUMMARY = 'aeo:build-summary';

/**
 * aeo:build-knowledge-graph — Knowledge Graph verisini değiştirir.
 * Fires when: Knowledge Graph JSON-LD oluşturulurken
 * Returns: Modify edilmiş KG object
 */
const AEO_BUILD_KNOWLEDGE_GRAPH = 'aeo:build-knowledge-graph';

// ---------------------------------------------------------------------------
// TEMPLATE HOOKS
// ---------------------------------------------------------------------------

/**
 * pseo:build-blocks — pSEO içerik bloklarını oluşturur/değiştirir.
 * Fires when: pSEO sayfası için içerik blokları oluşturulurken
 * Returns: PseoBlock array
 *
 * Legacy alias: 'pseo_blocks' (backward compat)
 */
const PSEO_BUILD_BLOCKS = 'pseo:build-blocks';

/**
 * template:head-elements — <head> içine eklenecek elementleri değiştirir.
 * Fires when: Layout render edilirken head elementler toplanırken
 * Returns: ReactNode array
 *
 * Legacy alias: 'head_elements' (backward compat)
 */
export const TEMPLATE_HEAD_ELEMENTS = 'template:head-elements';

/**
 * template:body-start — <body> açılışına element ekler.
 * Fires when: Layout render edilirken body başlangıcı
 * Returns: ReactNode array
 */
const TEMPLATE_BODY_START = 'template:body-start';

/**
 * template:body-end — <body> kapanışına element ekler.
 * Fires when: Layout render edilirken body sonu
 * Returns: ReactNode array
 */
const TEMPLATE_BODY_END = 'template:body-end';

/**
 * core:footer — Footer render edilmeden hemen önce tetiklenir.
 * Fires when: Footer render aşamasında
 * Returns: void (side effect only)
 */
export const CORE_FOOTER = 'core:footer';

/**
 * template:before-header — Header render öncesi tetiklenir.
 * Returns: void (side effect only)
 */
const TEMPLATE_BEFORE_HEADER = 'template:before-header';

/**
 * template:after-header — Header render sonrası tetiklenir.
 * Returns: void (side effect only)
 */
const TEMPLATE_AFTER_HEADER = 'template:after-header';

/**
 * template:before-footer — Footer render öncesi tetiklenir.
 * Returns: void (side effect only)
 */
const TEMPLATE_BEFORE_FOOTER = 'template:before-footer';

/**
 * template:after-footer — Footer render sonrası tetiklenir.
 * Returns: void (side effect only)
 */
const TEMPLATE_AFTER_FOOTER = 'template:after-footer';

// ---------------------------------------------------------------------------
// CACHE HOOKS
// ---------------------------------------------------------------------------

/**
 * cache:before-get — Cache okumasından hemen önce tetiklenir.
 * Fires when: CacheService.cached() çağrıldığında, cache lookup öncesi
 * Returns: void (side effect only)
 */
const CACHE_BEFORE_GET = 'cache:before-get';

/**
 * cache:after-set — Cache yazımından hemen sonra tetiklenir.
 * Fires when: CacheService.cached() yeni veriyle doldurulduğunda
 * Returns: void (side effect only)
 */
const CACHE_AFTER_SET = 'cache:after-set';

// ---------------------------------------------------------------------------
// LEGACY ALIASES
// ---------------------------------------------------------------------------

/**
 * Legacy hook isimlerinden yeni hook isimlerine alias map.
 * Geriye uyumluluk için kullanılır.
 */
const LEGACY_HOOK_ALIASES: Record<string, string> = {
  pseo_blocks: PSEO_BUILD_BLOCKS,
  head_elements: TEMPLATE_HEAD_ELEMENTS,
};

// ---------------------------------------------------------------------------
// CATEGORIZED HOOK DEFINITIONS
// ---------------------------------------------------------------------------

/**
 * Hook tanımı — bir hook hakkında metadata.
 * Tip çıkarımı için kullanılır, runtime'da kullanılmaz.
 */
const HOOK_DEFINITIONS: Record<string, HookDefinition> = {
  // DATA
  [PSEO_RESOLVE_PARAMS]: {
    name: PSEO_RESOLVE_PARAMS,
    description: 'pSEO parametrelerini çözümler',
    params: ['PseoParams'],
    returns: 'PseoParams',
    category: 'data',
  },
  [PSEO_GET_SERVICE]: {
    name: PSEO_GET_SERVICE,
    description: 'Servis verisini değiştirir',
    params: ['Service'],
    returns: 'Service',
    category: 'data',
  },
  [PSEO_GET_LOCATION]: {
    name: PSEO_GET_LOCATION,
    description: 'Lokasyon verisini değiştirir',
    params: ['PseoLocation'],
    returns: 'PseoLocation',
    category: 'data',
  },

  // CONTENT
  [PSEO_CONTENT_INTRO]: {
    name: PSEO_CONTENT_INTRO,
    description: 'pSEO intro metnini değiştirir',
    params: ['string', 'PseoParams'],
    returns: 'string',
    category: 'content',
  },
  [PSEO_CONTENT_PROCESS]: {
    name: PSEO_CONTENT_PROCESS,
    description: 'pSEO süreç adımlarını değiştirir',
    params: ['string[]', 'PseoParams'],
    returns: 'string[]',
    category: 'content',
  },
  [PSEO_CONTENT_BENEFIT]: {
    name: PSEO_CONTENT_BENEFIT,
    description: 'pSEO fayda maddelerini değiştirir',
    params: ['string[]', 'PseoParams'],
    returns: 'string[]',
    category: 'content',
  },
  [PSEO_CONTENT_TITLE]: {
    name: PSEO_CONTENT_TITLE,
    description: 'pSEO sayfa başlığını değiştirir',
    params: ['string', 'PseoParams'],
    returns: 'string',
    category: 'content',
  },
  [PSEO_CONTENT_DESCRIPTION]: {
    name: PSEO_CONTENT_DESCRIPTION,
    description: 'pSEO meta description\'ı değiştirir',
    params: ['string', 'PseoParams'],
    returns: 'string',
    category: 'content',
  },
  [CONTENT_INJECT_SECTION]: {
    name: CONTENT_INJECT_SECTION,
    description: 'Template\'lere yeni section enjekte eder',
    params: ['Record<string, any>', 'any'],
    returns: 'Record<string, any>',
    category: 'content',
  },
  [CONTENT_BEFORE_RENDER]: {
    name: CONTENT_BEFORE_RENDER,
    description: 'Template render olmadan hemen önce tetiklenir',
    params: ['any'],
    returns: 'void',
    category: 'content',
  },

  // SEO
  [SEO_GENERATE_META]: {
    name: SEO_GENERATE_META,
    description: 'SEO meta verisini değiştirir',
    params: ['SeoMeta', 'any'],
    returns: 'SeoMeta',
    category: 'seo',
  },
  [SEO_BUILD_SCHEMA]: {
    name: SEO_BUILD_SCHEMA,
    description: 'JSON-LD schema objesini değiştirir',
    params: ['object', 'any'],
    returns: 'object',
    category: 'seo',
  },
  [SEO_BUILD_GLOBAL_SCHEMA]: {
    name: SEO_BUILD_GLOBAL_SCHEMA,
    description: 'Global schema objesini değiştirir',
    params: ['object', 'any'],
    returns: 'object',
    category: 'seo',
  },

  // AEO
  [AEO_BUILD_SPEAKABLE]: {
    name: AEO_BUILD_SPEAKABLE,
    description: 'Speakable schema içeriğini değiştirir',
    params: ['SpeakableInput', 'any'],
    returns: 'SpeakableResult',
    category: 'aeo',
  },
  [AEO_EXTRACT_ENTITIES]: {
    name: AEO_EXTRACT_ENTITIES,
    description: 'Çıkarılan entity listesini değiştirir',
    params: ['EntityExtractInput', 'any'],
    returns: 'EntityExtractResult',
    category: 'aeo',
  },
  [AEO_OPTIMIZE_FAQ]: {
    name: AEO_OPTIMIZE_FAQ,
    description: 'FAQ\'ları AEO-optimize eder',
    params: ['FaqInput', 'any'],
    returns: 'FaqResult',
    category: 'aeo',
  },
  [AEO_BUILD_SUMMARY]: {
    name: AEO_BUILD_SUMMARY,
    description: 'AI Overviews/SGE için özet bloğu değiştirir',
    params: ['AeoSummaryInput', 'any'],
    returns: 'string',
    category: 'aeo',
  },
  [AEO_BUILD_KNOWLEDGE_GRAPH]: {
    name: AEO_BUILD_KNOWLEDGE_GRAPH,
    description: 'Knowledge Graph verisini değiştirir',
    params: ['KgInput', 'any'],
    returns: 'KgResult',
    category: 'aeo',
  },

  // TEMPLATE
  [PSEO_BUILD_BLOCKS]: {
    name: PSEO_BUILD_BLOCKS,
    description: 'pSEO içerik bloklarını oluşturur/değiştirir',
    params: ['PseoBlock[]', 'BuildPseoBlocksParams'],
    returns: 'PseoBlock[]',
    category: 'template',
  },
  [TEMPLATE_HEAD_ELEMENTS]: {
    name: TEMPLATE_HEAD_ELEMENTS,
    description: '<head> içine eklenecek elementleri değiştirir',
    params: ['ReactNode[]'],
    returns: 'ReactNode[]',
    category: 'template',
  },

  // CACHE
  [CACHE_BEFORE_GET]: {
    name: CACHE_BEFORE_GET,
    description: 'Cache okumasından hemen önce tetiklenir',
    params: ['string'],
    returns: 'void',
    category: 'cache',
  },
  [CACHE_AFTER_SET]: {
    name: CACHE_AFTER_SET,
    description: 'Cache yazımından hemen sonra tetiklenir',
    params: ['string', 'any'],
    returns: 'void',
    category: 'cache',
  },
};

// ---------------------------------------------------------------------------
// CATEGORIZED HOOK GROUPS
// ---------------------------------------------------------------------------

export const DATA_HOOKS = [
  PSEO_RESOLVE_PARAMS,
  PSEO_GET_SERVICE,
  PSEO_GET_LOCATION,
] as const;

export const CONTENT_HOOKS = [
  PSEO_CONTENT_INTRO,
  PSEO_CONTENT_PROCESS,
  PSEO_CONTENT_BENEFIT,
  PSEO_CONTENT_TITLE,
  PSEO_CONTENT_DESCRIPTION,
  CONTENT_INJECT_SECTION,
  CONTENT_BEFORE_RENDER,
  CONTENT_AFTER_RENDER,
  CONTENT_TITLE,
  CONTENT_DESCRIPTION,
] as const;

export const SEO_HOOKS = [
  SEO_GENERATE_META,
  SEO_BUILD_SCHEMA,
  SEO_BUILD_GLOBAL_SCHEMA,
] as const;

export const AEO_HOOKS = [
  AEO_BUILD_SPEAKABLE,
  AEO_EXTRACT_ENTITIES,
  AEO_OPTIMIZE_FAQ,
  AEO_BUILD_SUMMARY,
  AEO_BUILD_KNOWLEDGE_GRAPH,
] as const;

export const TEMPLATE_HOOKS = [
  PSEO_BUILD_BLOCKS,
  TEMPLATE_HEAD_ELEMENTS,
  TEMPLATE_BODY_START,
  TEMPLATE_BODY_END,
  CORE_FOOTER,
  TEMPLATE_BEFORE_HEADER,
  TEMPLATE_AFTER_HEADER,
  TEMPLATE_BEFORE_FOOTER,
  TEMPLATE_AFTER_FOOTER,
] as const;

export const CACHE_HOOKS = [
  CACHE_BEFORE_GET,
  CACHE_AFTER_SET,
] as const;

// ---------------------------------------------------------------------------
// UNION TYPES
// ---------------------------------------------------------------------------

/** Tüm DATA hook isimleri */
export type AllDataHooks = (typeof DATA_HOOKS)[number];
/** Tüm CONTENT hook isimleri */
export type AllContentHooks = (typeof CONTENT_HOOKS)[number];
/** Tüm SEO hook isimleri */
export type AllSeoHooks = (typeof SEO_HOOKS)[number];
/** Tüm AEO hook isimleri */
export type AllAeoHooks = (typeof AEO_HOOKS)[number];
/** Tüm TEMPLATE hook isimleri */
export type AllTemplateHooks = (typeof TEMPLATE_HOOKS)[number];
/** Tüm CACHE hook isimleri */
export type AllCacheHooks = (typeof CACHE_HOOKS)[number];

/** Tüm hook isimlerinin union type'ı */
type HookName =
  | AllDataHooks
  | AllContentHooks
  | AllSeoHooks
  | AllAeoHooks
  | AllTemplateHooks
  | AllCacheHooks;
