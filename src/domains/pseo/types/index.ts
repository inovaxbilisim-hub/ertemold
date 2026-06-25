import type { LocationMetadata, CityReference } from '@/lib/data-pseo';
import type { Service } from '@/core/types/content';

export interface PseoLocation {
  name: string;
  slug: string;
  citySlug: string;
  cityName: string;
}

export interface PseoParams {
  service: Record<string, unknown>;
  location: PseoLocation;
  isHubMode?: boolean;
}

export interface PseoContentContext {
  actionVerb: string;
  serviceSuffix: string;
  locationSuffix: string;
  h2Template: string;
  combinedServiceName: string;
}

export interface PseoContentResult {
  title: string;
  description: string;
  body: string;
}

export interface PseoBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface BuildPseoBlocksParams {
  service: Record<string, unknown>;
  sector?: Record<string, unknown>;
  location: {
    name: string;
    cityName: string;
  };
  metadata?: LocationMetadata | null;
  faqs?: Array<Record<string, unknown>>;
  settings?: Record<string, unknown> | null;
}

export interface PseoSettings {
  pseo_location_suffix?: string;
  pseo_action_verb?: string;
  pseo_service_suffix?: string;
}

export interface PseoService extends Service {
  pseo_action_verb?: string;
  pseo_service_suffix?: string;
  pseo_location_suffix?: string;
  pseo_h2_template?: string;
  [key: string]: unknown;
}

export { LocationMetadata, CityReference };
