import { describe, it, expect, beforeEach } from 'vitest';

describe('EntityExtractor', () => {
  beforeEach(async () => {
    delete (globalThis as any).__ERTEM_HOOK_REGISTRY__;
  });

  it('should extract Organization entity', async () => {
    const mod = await import('../EntityExtractor');
    const result = mod.EntityExtractor.extract(
      { content: 'Test content', serviceName: 'Epoksi' },
      { companyName: 'ERTEM Epoksi', sector: 'Zemin Kaplama' } as any,
    );

    const org = result.entities.find((e) => e['@type'] === 'Organization');
    expect(org).toBeDefined();
    expect(org?.name).toBe('ERTEM Epoksi');
  });

  it('should extract Service entity', async () => {
    const mod = await import('../EntityExtractor');
    const result = mod.EntityExtractor.extract(
      { content: 'Test', serviceName: 'Epoksi Zemin' },
      null,
    );

    const svc = result.entities.find((e) => e['@type'] === 'Service');
    expect(svc).toBeDefined();
    expect(svc?.name).toBe('Epoksi Zemin');
  });

  it('should extract Place entity from city name', async () => {
    const mod = await import('../EntityExtractor');
    const result = mod.EntityExtractor.extract(
      { content: 'Test', cityName: 'İstanbul' },
      null,
    );

    const place = result.entities.find((e) => e['@type'] === 'Place');
    expect(place).toBeDefined();
    expect(place?.name).toBe('İstanbul');
  });

  it('should support hook override', async () => {
    const mod = await import('../EntityExtractor');
    const { HookRegistry } = await import('@/core/hooks/HookRegistry');

    HookRegistry.addFilter('aeo:extract-entities', (result: any) => {
      result.entities.push({ '@type': 'Thing', name: 'Custom' });
      return result;
    });

    const result = mod.EntityExtractor.extract(
      { content: 'Test', serviceName: 'Svc' },
      { companyName: 'Company' } as any,
    );

    const custom = result.entities.find((e) => e['@type'] === 'Thing');
    expect(custom).toBeDefined();
    expect(custom?.name).toBe('Custom');
  });
});
