/**
 * pSEO Domain — barrel export.
 * Tüm pSEO servisleri, generator'ları, tipleri ve hook'ları buradan export edilir.
 */

// Types
export type {
  PseoParams,
  PseoLocation,
  PseoContentContext,
  PseoContentResult,
  PseoBlock,
  BuildPseoBlocksParams,
  PseoService,
} from './types';

// Services
export { PseoDataService } from './services/PseoDataService';
export { LocationService } from './services/LocationService';

// Generators
export { PseoContentGenerator } from './generators/PseoContentGenerator';
export { PseoBlockGenerator, buildPseoBlocks } from './generators/PseoBlockGenerator';

// Templates
export {
  introVariants,
  INTRO_VARIANTS_COUNT,
  getIntroVariantIndex,
  renderIntroVariant,
  processLines,
  PROCESS_LINES_COUNT,
  getProcessLine,
  benefitLines,
  BENEFIT_LINES_COUNT,
  getBenefitLine,
} from './generators/templates';

// Hooks
export { initPseoDomain } from './hooks/pseo-hooks';
