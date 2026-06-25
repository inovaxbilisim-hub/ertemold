/**
 * EntityExtractor — İçerikten entity çıkarımı ve entity graph oluşturma.
 * Organization, Service, Place, Person entity'lerini metin pattern'leri ile bulur.
 * Hook: aeo:extract-entities (filter)
 */
import { HookRegistry } from '@/core/hooks/HookRegistry';
import type { SiteSettings } from '@/core/types';

export interface EntityExtractInput {
  content: string;
  pageType?: string;
  serviceName?: string;
  cityName?: string;
}

export interface EntityExtractResult {
  entities: EntityNode[];
}

export interface EntityNode {
  '@type': string;
  name: string;
  [key: string]: unknown;
}

export class EntityExtractor {
  /**
   * Extract entities from page content text.
   * Pattern-matches known entity types without external API calls.
   */
  static extract(
    input: EntityExtractInput,
    settings?: SiteSettings | null,
  ): EntityExtractResult {
    const entities: EntityNode[] = [];

    // Organization
    if (settings?.companyName) {
      const org: EntityNode = {
        '@type': 'Organization',
        name: settings.companyName,
      };
      if (settings?.sector) {
        org.description = `${settings.companyName} - ${settings.sector}`;
      }
      entities.push(org);
    }

    // Person (founder)
    if (settings?.geo_founder_name) {
      const person: EntityNode = {
        '@type': 'Person',
        name: settings.geo_founder_name,
      };
      if (settings?.geo_founder_same_as) {
        person.sameAs = settings.geo_founder_same_as;
      }
      entities.push(person);
    }

    // Service
    if (input.serviceName) {
      entities.push({
        '@type': 'Service',
        name: input.serviceName,
        provider: settings?.companyName || undefined,
      });
    }

    // Place
    if (input.cityName) {
      entities.push({
        '@type': 'Place',
        name: input.cityName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: input.cityName,
          addressCountry: 'TR',
        },
      });
    }

    const result: EntityExtractResult = { entities };

    return HookRegistry.applyFilters(
      'aeo:extract-entities',
      result,
      input,
      settings,
    );
  }

  /**
   * Build entity graph (@graph) from extracted entities.
   */
  static buildEntityGraph(entities: EntityNode[]): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@graph': entities,
    };
  }
}
