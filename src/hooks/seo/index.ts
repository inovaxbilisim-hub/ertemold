/**
 * SEO Hooks — Barrel export
 */

export { useSEO, type SEOParams, type SEOOutput } from './useSEO';
export { 
  type SchemaType,
  type OrganizationSchema,
  type LocalBusinessSchema,
  type ServiceSchema,
  type FAQPageSchema,
  type BreadcrumbSchema,
  type HowToSchema,
  buildOrganizationSchema,
  buildLocalBusinessSchema,
  buildFAQSchema,
  buildBreadcrumbSchema,
  buildHowToSchema,
  buildServiceSchema,
} from './useStructuredData';
export { 
  useBreadcrumb, 
  type Crumb,
  createStaticBreadcrumbs,
  createServiceBreadcrumb,
} from './useBreadcrumb';