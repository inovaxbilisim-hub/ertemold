import { LocationMetadata } from '@/lib/data-pseo';

export interface PseoBlock {
  id: string;
  type: string;
  data: any;
}

interface BuildPseoBlocksParams {
  service: any;
  sector?: any;
  location: {
    name: string;
    cityName: string;
  };
  metadata?: LocationMetadata | null;
  faqs?: any[];
  settings?: any;
}

/**
 * Barrel export — delegates to PseoBlockGenerator from the domain layer.
 * Legacy file: new code should import from @/domains/pseo directly.
 */
import { PseoBlockGenerator } from '@/domains/pseo/generators/PseoBlockGenerator';

export function buildPseoBlocks(params: BuildPseoBlocksParams): PseoBlock[] {
  return PseoBlockGenerator.build(params);
}

