/**
 * AiOverviewsHelper — AI Overviews / SGE için özet blok ve HTML marker'ları.
 * Hook: aeo:build-summary (filter)
 */
import { HookRegistry } from '@/core/hooks/HookRegistry';

export interface AeoSummaryInput {
  title: string;
  description: string;
  features?: string[];
  query?: string;
}

export class AiOverviewsHelper {
  /**
   * Build a concise 2-3 sentence AI-friendly summary block.
   * Optimized for Google AI Overviews / SGE snippet extraction.
   */
  static buildAeoSummaryBlock(input: AeoSummaryInput): string {
    const parts: string[] = [];

    parts.push(input.title);

    if (input.description) {
      parts.push(input.description);
    }

    if (input.features && input.features.length > 0) {
      const featureText = input.features.slice(0, 3).join(', ');
      parts.push(`Öne çıkan özellikler: ${featureText}.`);
    }

    const summary = parts.join(' — ');

    return HookRegistry.applyFilters('aeo:build-summary', summary, input);
  }

  /**
   * Inject AI-friendly markers into HTML content.
   * Adds data-aeo attributes to lists, tables, and headings
   * for better AI parser extraction.
   */
  static injectAiFriendlyMarkers(html: string): string {
    let result = html;

    // Mark headings
    result = result.replace(
      /<h([12])(.*?)>/gi,
      '<h$1$2 data-aeo="heading" data-aeo-level="$1">',
    );

    // Mark lists
    result = result.replace(
      /<ul(.*?)>/gi,
      '<ul$1 data-aeo="list" data-aeo-type="unordered">',
    );
    result = result.replace(
      /<ol(.*?)>/gi,
      '<ol$1 data-aeo="list" data-aeo-type="ordered">',
    );

    // Mark tables
    result = result.replace(
      /<table(.*?)>/gi,
      '<table$1 data-aeo="table">',
    );

    // Mark paragraphs with statistical/summary content
    result = result.replace(
      /<p(.*?)>(.*?(?:yüzde|%|TL|metrekare|m²|yıl|saat|gün).*?)<\/p>/gi,
      '<p$1 data-aeo="stat">$2</p>',
    );

    return result;
  }
}
