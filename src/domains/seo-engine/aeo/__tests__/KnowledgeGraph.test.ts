import { describe, it, expect, vi, beforeEach } from 'vitest';

const sharedCache = new Map<string, unknown>();

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown, keyParts: string[]) => {
    const cacheKey = keyParts.join('::');
    return async () => {
      if (sharedCache.has(cacheKey)) return sharedCache.get(cacheKey);
      const result = await fn();
      sharedCache.set(cacheKey, result);
      return result;
    };
  },
  revalidateTag: vi.fn(),
}));

describe('KnowledgeGraph', () => {
  beforeEach(async () => {
    delete (globalThis as any).__ERTEM_HOOK_REGISTRY__;
    sharedCache.clear();
  });

  it('should build @graph with Organization', async () => {
    const mod = await import('../KnowledgeGraph');

    const result = await mod.KnowledgeGraph.build({
      settings: {
        companyName: 'ERTEM Epoksi',
        title: 'ERTEM',
        sector: 'Zemin Kaplama',
        socialMedia: [],
        brand: {},
      } as any,
      services: [],
      locations: [],
    });

    expect(result['@context']).toBe('https://schema.org');
    expect(Array.isArray(result['@graph'])).toBe(true);
  });

  it('should include services in graph', async () => {
    const mod = await import('../KnowledgeGraph');

    const result = await mod.KnowledgeGraph.build({
      settings: {
        companyName: 'ERTEM',
        title: 'ERTEM',
        socialMedia: [],
        brand: {},
      } as any,
      services: [
        { title: 'Epoksi Zemin', slug: 'epoksi-zemin', description: 'Test' } as any,
      ],
      locations: [],
    });

    const serviceNode = result['@graph'].find((n: any) => n['@type'] === 'Service');
    expect(serviceNode).toBeDefined();
    expect(serviceNode?.name).toBe('Epoksi Zemin');
  });

  it('should include locations in graph as LocalBusiness', async () => {
    const mod = await import('../KnowledgeGraph');

    const result = await mod.KnowledgeGraph.build({
      settings: {
        companyName: 'ERTEM',
        title: 'ERTEM',
        socialMedia: [],
        brand: {},
        phone: '0212 555 5555',
      } as any,
      services: [{ title: 'Epoksi', slug: 'epoksi' } as any],
      locations: [{ name: 'İstanbul', slug: 'istanbul' }],
    });

    const business = result['@graph'].find((n: any) => n['@type'] === 'LocalBusiness');
    expect(business).toBeDefined();
    expect(business?.name).toContain('İstanbul');
  });

  it('should support hook override', async () => {
    const mod = await import('../KnowledgeGraph');
    const { HookRegistry } = await import('@/core/hooks/HookRegistry');

    HookRegistry.addFilter('aeo:build-knowledge-graph', (result: any) => {
      result['@graph'].push({ '@type': 'CustomNode', name: 'Custom' });
      return result;
    });

    const result = await mod.KnowledgeGraph.build({
      settings: { companyName: 'T', title: 'T', socialMedia: [], brand: {} } as any,
      services: [],
      locations: [],
    });

    const custom = result['@graph'].find((n: any) => n['@type'] === 'CustomNode');
    expect(custom).toBeDefined();
  });
});
