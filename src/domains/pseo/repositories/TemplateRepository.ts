import 'server-only';
import { dbAll } from '@/core/database/db';
import { cacheService } from '@/core/cache/CacheService';
import { CACHE_TAGS } from '@/core/cache/tags';
import { introVariants, INTRO_VARIANTS_COUNT } from '../generators/templates/intro-variants';
import { processLines, PROCESS_LINES_COUNT } from '../generators/templates/process-lines';
import { benefitLines, BENEFIT_LINES_COUNT } from '../generators/templates/benefit-lines';

export type TemplateType = 'intro' | 'process' | 'benefit';

export interface PseoTemplateRow {
  id: number;
  type: TemplateType;
  content: string;
  seed_index: number;
  service_slug: string | null;
  is_active: boolean;
}

export interface TemplateFetchOptions {
  type: TemplateType;
  seedIndex: number;
  serviceSlug?: string;
}

/**
 * TemplateRepository — pSEO template'lerini DB'den çeker, fallback olarak hardcoded kullanır.
 * DB'de kayıt yoksa mevcut TypeScript template'leri kullanılır (geriyee uyumluluk).
 */
export class TemplateRepository {
  private static readonly CACHE_TTL = 86400; // 1 day

  /**
   * DB'den template satırlarını getirir, cache'ler.
   */
  static async getTemplatesFromDb(type: TemplateType): Promise<PseoTemplateRow[]> {
    return cacheService.cached<PseoTemplateRow[]>(
      `pseo:templates:${type}`,
      async () => {
        const rows = await dbAll<PseoTemplateRow>(
          `SELECT id, type, content, seed_index, service_slug, is_active
           FROM pseo_templates
           WHERE type = $1 AND is_active = TRUE
           ORDER BY seed_index ASC`,
          [type],
        );
        return rows;
      },
      { tags: [CACHE_TAGS.PSEO_CONTENT], ttl: TemplateRepository.CACHE_TTL },
    );
  }

  /**
   * Bir template içeriğini getirir.
   * Priority: 1) service_slug match, 2) seed_index match, 3) fallback
   */
  static async getContent(options: TemplateFetchOptions): Promise<string> {
    const { type, seedIndex, serviceSlug } = options;

    // 1. DB'den dene
    try {
      const rows = await TemplateRepository.getTemplatesFromDb(type);

      // Önce service_slug'a özel template
      if (serviceSlug) {
        const serviceMatch = rows.find(
          (r) => r.service_slug === serviceSlug && r.seed_index === seedIndex,
        );
        if (serviceMatch) return serviceMatch.content;
      }

      // Sonra seed_index'e göre genel template
      const indexMatch = rows.find(
        (r) => r.service_slug === null && r.seed_index === seedIndex,
      );
      if (indexMatch) return indexMatch.content;
    } catch (error) {
      console.warn(
        `[TemplateRepository] DB fetch failed for ${type}, using fallback:`,
        error,
      );
    }

    // 2. Fallback: hardcoded template'ler
    return TemplateRepository.getFallbackContent(type, seedIndex);
  }

  /**
   * Birden çok template içeriğini toplu getirir.
   * DB batch desteği olmadığında her biri için ayrı çağrı yapılır.
   */
  static async getContents(
    type: TemplateType,
    seedIndex: number,
    count: number,
    serviceSlug?: string,
  ): Promise<string[]> {
    // Cache-friendly: tüm template'leri bir kerede çek
    try {
      const rows = await TemplateRepository.getTemplatesFromDb(type);
      if (rows.length > 0) {
        const results: string[] = [];
        for (let i = 0; i < count; i++) {
          const idx = (seedIndex + i) % rows.length;
          // service_slug match veya genel
          const serviceMatch =
            serviceSlug &&
            rows.find(
              (r) => r.service_slug === serviceSlug && r.seed_index === idx,
            );
          const fallbackMatch = rows.find(
            (r) => r.service_slug === null && r.seed_index === idx,
          );
          results.push((serviceMatch || fallbackMatch)?.content ?? '');
        }
        if (results.some((r) => r !== '')) return results;
      }
    } catch {
      // fallback'e düş
    }

    // Fallback
    const fallbacks = TemplateRepository.getFallbackContents(type, count);
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(fallbacks[(seedIndex + i) % fallbacks.length]);
    }
    return results;
  }

  // ---------------------------------------------------------------------------
  // FALLBACK: Hardcoded template'ler (original TS arrays)
  // ---------------------------------------------------------------------------

  private static getFallbackContent(type: TemplateType, index: number): string {
    switch (type) {
      case 'intro':
        return introVariants[index % INTRO_VARIANTS_COUNT] ?? introVariants[0];
      case 'process':
        return processLines[index % PROCESS_LINES_COUNT] ?? processLines[0];
      case 'benefit':
        return benefitLines[index % BENEFIT_LINES_COUNT] ?? benefitLines[0];
      default:
        return '';
    }
  }

  private static getFallbackContents(
    type: TemplateType,
    _count: number,
  ): string[] {
    switch (type) {
      case 'intro':
        return [...introVariants];
      case 'process':
        return [...processLines];
      case 'benefit':
        return [...benefitLines];
      default:
        return [];
    }
  }
}
