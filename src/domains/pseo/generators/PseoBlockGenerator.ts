import { HookRegistry } from '@/core/hooks/HookRegistry';
import type { PseoBlock, BuildPseoBlocksParams } from '../types';

/**
 * PseoBlockGenerator — Hook-based block builder.
 * Plugin'ler 'pseo:build-blocks' filter'ına takılarak kendi bloklarını ekler.
 */
export class PseoBlockGenerator {
  /**
   * pSEO içerik bloklarını oluşturur.
   * Plugin'ler addFilter('pseo:build-blocks', callback) ile blok ekler.
   */
  static build(params: BuildPseoBlocksParams): PseoBlock[] {
    const blocks = HookRegistry.applyFilters('pseo:build-blocks', [], params);

    return blocks;
  }
}

/**
 * Legacy wrapper — mevcut buildPseoBlocks fonksiyonu ile aynı API.
 * Geriye uyumluluk için.
 */
export function buildPseoBlocks(params: BuildPseoBlocksParams): PseoBlock[] {
  return PseoBlockGenerator.build(params);
}
