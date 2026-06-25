import { serviceContainer } from '@/core/hooks/ServiceContainer';
import { PseoDataService } from '../services/PseoDataService';

/**
 * pSEO domain hook registration'ları.
 * Domain başlatılırken gerekli servisleri ve default filter'ları register eder.
 */
export function initPseoDomain(): void {
  // PseoDataService'i DI container'a register et
  if (!serviceContainer.has('pseo.data')) {
    serviceContainer.register('pseo.data', () => PseoDataService);
  }
}
