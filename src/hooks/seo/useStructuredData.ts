/**
 * useStructuredData — JSON-LD Schema.org verisi inject hook'u
 * 
 * Sayfalara dinamik olarak Schema.org JSON-LD verisi ekler.
 * Client ve Server component'lerde çalışır.
 * 
 * @example
 * ```tsx
 * // Server Component'te
 * const schema = useStructuredData('organization', {
 *   name: 'Şirket Adı',
 *   url: 'https://example.com',
 * });
 * 
 * return <StructuredData data={schema} />;
 * ```
 */

export type SchemaType = 
  | 'organization'
  | 'localBusiness'
  | 'service'
  | 'professionalService'
  | 'webSite'
  | 'faqPage'
  | 'breadcrumb'
  | 'howTo'
  | 'collectionPage'
  | 'article'
  | 'person';

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  knowsAbout?: string[];
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    availableLanguage?: string[];
  };
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressCountry: string;
  };
}

export interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  url: string;
  image?: string;
  telephone?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHours?: string;
  priceRange?: string;
  servesCuisine?: string;
  areaServed?: string | string[];
}

export interface ServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'Service';
  name: string;
  description?: string;
  serviceType?: string;
  provider: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  areaServed?: Array<{ '@type': 'AdministrativeArea'; name: string }>;
  image?: string[];
  url?: string;
}

export interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface HowToSchema {
  '@context': 'https://schema.org';
  '@type': 'HowTo';
  name: string;
  description?: string;
  step: Array<{
    '@type': 'HowToStep';
    position: number;
    text: string;
  }>;
}

/**
 * Organization schema oluşturur.
 */
export function buildOrganizationSchema(params: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  telephone?: string;
  address?: string;
  knowsAbout?: string[];
  sameAs?: string[];
}): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: params.name,
    url: params.url,
    ...(params.logo && { logo: params.logo }),
    ...(params.description && { description: params.description }),
    ...(params.telephone && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: params.telephone,
        contactType: 'customer service',
        availableLanguage: ['Turkish'],
      },
    }),
    ...(params.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: params.address,
        addressCountry: 'TR',
      },
    }),
    ...(params.knowsAbout?.length && { knowsAbout: params.knowsAbout }),
    ...(params.sameAs?.length && { sameAs: params.sameAs }),
  };
}

/**
 * LocalBusiness schema oluşturur (şubeler için).
 */
export function buildLocalBusinessSchema(params: {
  name: string;
  url: string;
  image?: string;
  telephone?: string;
  streetAddress?: string;
  addressLocality?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  priceRange?: string;
  areaServed?: string[];
}): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: params.name,
    url: params.url,
    ...(params.image && { image: params.image }),
    ...(params.telephone && { telephone: params.telephone }),
    address: {
      '@type': 'PostalAddress',
      ...(params.streetAddress && { streetAddress: params.streetAddress }),
      ...(params.addressLocality && { addressLocality: params.addressLocality }),
      ...(params.postalCode && { postalCode: params.postalCode }),
      addressCountry: 'TR',
    },
    ...((params.latitude !== undefined && params.longitude !== undefined) && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: params.latitude,
        longitude: params.longitude,
      },
    }),
    ...(params.openingHours && { openingHours: params.openingHours }),
    ...(params.priceRange && { priceRange: params.priceRange }),
    ...(params.areaServed && { areaServed: params.areaServed }),
  };
}

/**
 * FAQPage schema oluşturur.
 */
export function buildFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * BreadcrumbList schema oluşturur.
 */
export function buildBreadcrumbSchema(
  crumbs: Array<{ label: string; href?: string }>,
  siteUrl: string
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.href && {
        item: new URL(crumb.href.startsWith('/') ? crumb.href : `/${crumb.href}`, siteUrl).toString(),
      }),
    })),
  };
}

/**
 * HowTo schema oluşturur.
 */
export function buildHowToSchema(
  name: string,
  description: string,
  steps: string[]
): HowToSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    ...(description && { description }),
    step: steps.map((text, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text,
    })),
  };
}

/**
 * Service schema oluşturur.
 */
export function buildServiceSchema(params: {
  name: string;
  description?: string;
  serviceType?: string;
  providerName: string;
  providerUrl: string;
  image?: string;
  url?: string;
  areaServed?: string[];
}): ServiceSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    ...(params.description && { description: params.description }),
    ...(params.serviceType && { serviceType: params.serviceType }),
    provider: {
      '@type': 'Organization',
      name: params.providerName,
      url: params.providerUrl,
    },
    ...(params.image && { image: [params.image] }),
    ...(params.url && { url: params.url }),
    ...(params.areaServed && {
      areaServed: params.areaServed.map((name) => ({
        '@type': 'AdministrativeArea',
        name,
      })),
    }),
  };
}