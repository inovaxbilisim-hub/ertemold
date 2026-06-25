import { describe, it, expect, beforeEach } from 'vitest';

describe('SpeakableGenerator', () => {
  beforeEach(async () => {
    delete (globalThis as any).__ERTEM_HOOK_REGISTRY__;
  });

  it('should generate valid SpeakableSpecification schema', async () => {
    const mod = await import('../SpeakableGenerator');
    const result = await mod.SpeakableGenerator.build({
      title: 'Test Title',
      description: 'Test description',
      pageType: 'pseo_location',
    });

    expect(result['@type']).toBe('SpeakableSpecification');
    expect(result['@context']).toBe('https://schema.org');
    expect(Array.isArray(result.cssSelector)).toBe(true);
  });

  it('should include cssSelectors for key elements', async () => {
    const mod = await import('../SpeakableGenerator');
    const result = await mod.SpeakableGenerator.build({
      title: 'Test',
      description: 'Desc',
      content: 'Content',
    });

    expect(result.cssSelector).toContain('h1');
    expect(result.cssSelector).toContain('h2');
    expect(result.cssSelector).toContain('.hero-description');
    expect(result.cssSelector).toContain('.aeo-summary');
  });

  it('should include location-specific selectors for pseo pages', async () => {
    const mod = await import('../SpeakableGenerator');
    const result = await mod.SpeakableGenerator.build({
      title: 'Test',
      description: 'Desc',
      pageType: 'pseo_location',
    });

    expect(result.cssSelector).toContain('.service-location-content');
  });

  it('should support hook override', async () => {
    const mod = await import('../SpeakableGenerator');
    const { HookRegistry } = await import('@/core/hooks/HookRegistry');

    HookRegistry.addFilter('aeo:build-speakable', (result: any) => {
      result.cssSelector.push('.custom-selector');
      return result;
    });

    const result = await mod.SpeakableGenerator.build({
      title: 'Test',
      description: 'Desc',
    });

    expect(result.cssSelector).toContain('.custom-selector');
  });
});
