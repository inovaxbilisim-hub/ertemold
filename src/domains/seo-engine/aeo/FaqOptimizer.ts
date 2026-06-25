/**
 * FaqOptimizer — FAQ'ları AEO-friendly format'a dönüştürür.
 * Kısa cevaplar, net yapı, schema.org/FAQPage + Speakable uyumu.
 * Hook: aeo:optimize-faq (filter)
 */
import { HookRegistry } from '@/core/hooks/HookRegistry';

export interface FaqInput {
  question: string;
  answer: string;
  category?: string;
}

export interface OptimizedFaq {
  question: string;
  answer: string;
}

export interface FaqResult {
  optimized: OptimizedFaq[];
  schema: Record<string, unknown>;
}

const MAX_AEO_ANSWER_LENGTH = 60;

/**
 * Truncate answer to AEO-friendly snippet length.
 */
function truncateForAEO(answer: string, maxLength = MAX_AEO_ANSWER_LENGTH): string {
  if (answer.length <= maxLength) return answer;

  const truncated = answer.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  const base = lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated;
  return `${base.trim()}...`;
}

export class FaqOptimizer {
  /**
   * Optimize FAQ array for AEO.
   * Short answers + valid FAQPage schema.
   */
  static optimize(faqs: FaqInput[]): FaqResult {
    const optimized = faqs.map((faq) => ({
      question: faq.question.trim(),
      answer: truncateForAEO(faq.answer),
    }));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: optimized.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    const result: FaqResult = { optimized, schema };

    return HookRegistry.applyFilters('aeo:optimize-faq', result, faqs);
  }

  /**
   * Build AEO FAQPage schema separately.
   */
  static buildAeoFaqSchema(faqs: FaqInput[]): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: truncateForAEO(faq.answer),
        },
      })),
    };
  }
}
