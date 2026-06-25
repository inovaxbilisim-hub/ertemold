/**
 * KnowledgeGraph — Organization + Service + LocalBusiness @graph JSON-LD üretici.
 * Hook: aeo:build-knowledge-graph (filter)
 */
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { cacheService } from '@/core/cache/CacheService';
import { CACHE_TAGS } from '@/core/cache/tags';
import { getSiteUrl } from '@/core/utils/host';
import type { SiteSettings, Service } from '@/core/types';

export interface KgInput {
  settings: SiteSettings | null;
  services: Service[];
  locations?: KgLocation[];
}

export interface KgLocation {
  name: string;
  cityName?: string;
  slug: string;
}

export interface KgResult {
  '@context': string;
  '@graph': Record<string, unknown>[];
  [key: string]: unknown;
}

async function getAbsoluteUrl(
  path: string | undefined,
  baseUrl: string,
): Promise<string | undefined> {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  try {
    return new URL(path.startsWith('/') ? path : `/${path}`, baseUrl).toString();
  } catch {
    return path;
  }
}

function uniqStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => v.length > 0),
    ),
  );
}

export class KnowledgeGraph {
  /**
   * Build full @graph Knowledge Graph with Organization, Service, LocalBusiness.
   * Uses CacheService for caching.
   */
  static async build(input: KgInput): Promise<KgResult> {
    const { settings, services, locations } = input;
    if (!settings) {
      return { '@context': 'https://schema.org', '@graph': [] };
    }

    const siteUrl = await getSiteUrl(settings);
    const graph: Record<string, unknown>[] = [];

    // Organization node
    const orgSchema = await KnowledgeGraph.buildOrganizationSchema(settings);
    if (orgSchema) {
      graph.push(orgSchema);
    }

    // Service nodes
    for (const service of services) {
      if (!service.active && service.active !== undefined) continue;
      const serviceUrl = `${siteUrl}/hizmetler/${service.slug}`;
      graph.push({
        '@type': 'Service',
        name: service.title,
        url: serviceUrl,
        provider: {
          '@type': 'Organization',
          name: settings.companyName || settings.title,
        },
        description: service.description || undefined,
        areaServed: locations?.map((loc) => ({
          '@type': 'City',
          name: loc.name,
        })) || undefined,
      });
    }

    // LocalBusiness nodes (per location)
    if (locations && locations.length > 0) {
      for (const loc of locations.slice(0, 20)) {
        // Limit to 20
        graph.push({
          '@type': 'LocalBusiness',
          name: `${settings.companyName || settings.title} - ${loc.name}`,
          url: `${siteUrl}/hizmetler/${services[0]?.slug || ''}/${loc.slug}`,
          areaServed: {
            '@type': 'City',
            name: loc.cityName || loc.name,
          },
          telephone: settings.phone || undefined,
          address: settings.address
            ? {
                '@type': 'PostalAddress',
                streetAddress: settings.address,
                addressLocality: loc.name,
                addressCountry: 'TR',
              }
            : undefined,
        });
      }
    }

    const result: KgResult = {
      '@context': 'https://schema.org',
      '@graph': graph,
    };

    return HookRegistry.applyFiltersAsync(
      'aeo:build-knowledge-graph',
      result,
      input,
    );
  }

  /**
   * Build rich Organization schema node.
   */
  static async buildOrganizationSchema(
    settings: SiteSettings | null,
  ): Promise<Record<string, unknown> | null> {
    if (!settings) return null;

    return cacheService.cached(
      `org-schema-${settings.id || 'default'}`,
      async () => {
        const siteUrl = await getSiteUrl(settings);
        const logoUrl = await getAbsoluteUrl(
          settings.brand?.logoPath,
          siteUrl,
        );
        const providerName = settings.companyName || settings.title || 'Kurumsal İşletme';

        const knowsAbout = settings.geo_know_about
          ? settings.geo_know_about.split(',').map((s) => s.trim().replace(/\.+$/, ''))
          : settings.sector
            ? [settings.sector]
            : [];

        const sameAs = uniqStrings(
          (settings.socialMedia || [])
            .filter((s) => s.active)
            .map((s) => s.url),
        );

        const schema: Record<string, unknown> = {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: providerName,
          url: siteUrl,
          logo: logoUrl,
          description: settings.companyDescription || undefined,
          knowsAbout: knowsAbout.length > 0 ? knowsAbout : undefined,
          sameAs: sameAs.length > 0 ? sameAs : undefined,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: settings.phone || undefined,
            contactType: 'customer service',
            availableLanguage: ['Turkish'],
          },
        };

        if (settings.address) {
          schema.address = {
            '@type': 'PostalAddress',
            streetAddress: settings.address,
            addressCountry: 'TR',
          };
        }

        if (settings.geo_founder_name) {
          schema.founder = {
            '@type': 'Person',
            name: settings.geo_founder_name,
            sameAs: settings.geo_founder_same_as || undefined,
          };
        }

        return schema;
      },
      {
        tags: [CACHE_TAGS.KNOWLEDGE_GRAPH, CACHE_TAGS.SETTINGS],
        ttl: 604800,
      },
    );
  }
}
