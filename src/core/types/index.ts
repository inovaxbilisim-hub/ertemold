// Core Types — Domain-based barrel exports
export * from "./content";
export * from "./settings";
export * from "./seo";
export * from "./analytics";
export * from "./calculator";

import type {
  Service,
  Reference,
  ServiceCategory,
  Stat,
  SectionContent,
  Page,
  HeroData,
  FAQ,
  Sector,
} from "./content";
import type { SiteSettings, Branch } from "./settings";

// Explicitly re-export common types to avoid barrel resolution issues in some environments
export type {
  Service,
  Reference,
  ServiceCategory,
  Stat,
  SectionContent,
  Page,
  HeroData,
  FAQ,
  Sector,
  SiteSettings,
  Branch,
};
