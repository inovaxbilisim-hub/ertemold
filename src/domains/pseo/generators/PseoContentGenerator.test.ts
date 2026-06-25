import { describe, it, expect, vi, beforeEach } from 'vitest';

// server-only throws in vitest; mock as empty module
vi.mock('server-only', () => ({}));

// Mock ClimateService to avoid unstable_cache in tests
vi.mock('@/domains/climate', () => ({
  ClimateService: {
    getProfileForCity: vi.fn(async () => ({
      id: 1,
      code: 'karasal',
      nameTr: 'Karasal İklim',
      conditionDescription: 'gece-gündüz arası yüksek sıcaklık farklarına',
      recommendationSuffix: 'termal şoklara ve sıcaklık farklılıklarına karşı esnekliğini koruyan, çatlama yapmayan özel poliüretan destekli sistemler sunuyoruz.',
      sortOrder: 0,
      active: true,
    })),
    getAllProfiles: vi.fn(async () => []),
    getProfileByCode: vi.fn(async () => null),
  },
}));

describe('PseoContentGenerator', () => {
  beforeEach(async () => {
    delete (globalThis as any).__ERTEM_HOOK_REGISTRY__;
  });

  it('should export 24 intro variants', async () => {
    const { introVariants } = await import('./templates/intro-variants');
    expect(introVariants.length).toBe(24);
  });

  it('should generate title for service+city', async () => {
    delete (globalThis as any).__ERTEM_HOOK_REGISTRY__;

    const { PseoContentGenerator } = await import('./PseoContentGenerator');
    const result = await PseoContentGenerator.generate({
      service: {
        id: 1,
        title: 'Epoksi Zemin',
        slug: 'epoksi-zemin',
        description: '',
        seo: { h1: '', seoDescription: '', serviceSummary: '', icon: '', label: '' },
        active: true,
        categories: [],
        createdAt: '',
        updatedAt: '',
      },
      location: {
        name: 'İstanbul',
        slug: 'istanbul',
        cityName: 'İstanbul',
        citySlug: 'istanbul',
      },
    }, undefined);

    expect(result.title).toBeDefined();
    expect(result.title.length).toBeGreaterThan(0);
  });

  it('should support hook override on title', async () => {
    delete (globalThis as any).__ERTEM_HOOK_REGISTRY__;

    const mod = await import('./PseoContentGenerator');
    const { HookRegistry } = await import('@/core/hooks/HookRegistry');

    HookRegistry.addFilter('pseo:content-title', (title: string) => `HOOKED: ${title}`);

    const result = await mod.PseoContentGenerator.generate({
      service: {
        id: 1,
        title: 'Epoksi',
        slug: 'epoksi',
        description: '',
        seo: { h1: '', seoDescription: '', serviceSummary: '', icon: '', label: '' },
        active: true,
        categories: [],
        createdAt: '',
        updatedAt: '',
      },
      location: {
        name: 'Ankara',
        slug: 'ankara',
        cityName: 'Ankara',
        citySlug: 'ankara',
      },
    }, undefined);

    expect(result.title).toContain('HOOKED');
  });

  it('should generate description', async () => {
    delete (globalThis as any).__ERTEM_HOOK_REGISTRY__;

    const { PseoContentGenerator } = await import('./PseoContentGenerator');
    const result = await PseoContentGenerator.generate({
      service: {
        id: 1,
        title: 'Epoksi Zemin Kaplama',
        slug: 'epoksi-zemin-kaplama',
        description: '',
        seo: { h1: '', seoDescription: '', serviceSummary: '', icon: '', label: '' },
        active: true,
        categories: [],
        createdAt: '',
        updatedAt: '',
      },
      location: {
        name: 'İzmir',
        slug: 'izmir',
        cityName: 'İzmir',
        citySlug: 'izmir',
      },
    }, undefined);

    expect(result.description).toBeDefined();
    expect(result.description.length).toBeGreaterThan(10);
  });
});
