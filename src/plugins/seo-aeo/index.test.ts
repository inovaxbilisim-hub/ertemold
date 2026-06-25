import { beforeEach, describe, expect, it } from 'vitest';
import type { AeoSummaryBlockProps } from '@/modules/content/sections/AeoSummaryBlock';

describe('seo-aeo plugin', () => {
  beforeEach(() => {
    delete (globalThis as any).__ERTEM_HOOK_REGISTRY__;
  });

  it('registers an AEO summary block hook', async () => {
    const { initPlugin } = await import('./index');
    const { HookRegistry } = await import('@/core/hooks/HookRegistry');

    initPlugin();

    const summary = HookRegistry.applyFilters<AeoSummaryBlockProps | null>('aeo_summary_block', null, {
      pageType: 'service_detail',
      service: {
        title: 'Epoksi Zemin Kaplama',
        description: 'Dayanıklı, hijyenik ve uzun ömürlü kaplama çözümleri.',
        features: ['Kaymaz yüzey', 'Kimyasal dayanım'],
        category: 'Zemin',
      },
      category: { name: 'Zemin Kaplama' },
      faqs: [{}, {}],
    });

    expect(summary).not.toBeNull();
    expect(summary?.title).toBe('Epoksi Zemin Kaplama');
    expect(summary?.items).toHaveLength(3);
    expect(summary?.summary).toContain('Epoksi Zemin Kaplama');
  });
});
