/**
 * SpeakableGenerator — AEO Speakable schema üretici.
 * schema.org/SpeakableSpecification JSON-LD üretir.
 * Hook: aeo:build-speakable (filter)
 */
import { HookRegistry } from '@/core/hooks/HookRegistry';

export interface SpeakableInput {
  title: string;
  description: string;
  content?: string;
  pageType?: string;
}

export interface SpeakableResult {
  '@context': string;
  '@type': 'SpeakableSpecification';
  cssSelector: string[];
  [key: string]: unknown;
}

export class SpeakableGenerator {
  /**
   * Build SpeakableSpecification schema for a given page content.
   * Default CSS selectors target key content areas.
   */
  static async build(input: SpeakableInput): Promise<SpeakableResult> {
    const selectors: string[] = ['h1', 'h2'];

    if (input.description) {
      selectors.push('.hero-description');
    }

    if (input.content) {
      selectors.push('.aeo-summary');
    }

    if (input.pageType === 'pseo_location') {
      selectors.push('.service-location-content');
    }

    const result: SpeakableResult = {
      '@context': 'https://schema.org',
      '@type': 'SpeakableSpecification',
      cssSelector: selectors,
    };

    return HookRegistry.applyFiltersAsync('aeo:build-speakable', result, input);
  }
}
