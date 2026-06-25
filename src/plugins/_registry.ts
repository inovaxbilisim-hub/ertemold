/**
 * Plugin Registry — Tüm plugin'lerin manifest dosyası.
 * Her plugin'in hangi hook'ları kullandığını ve önceliğini tanımlar.
 */
export type PluginPreset = 'core' | 'seo' | 'industry' | 'full';

export interface PluginManifest {
  name: string;
  description: string;
  hooks: string[];
  priority: number;
  preset: PluginPreset;
}

export const PRESET_DEFINITIONS: Record<PluginPreset, { label: string; description: string }> = {
  core:     { label: 'Temel',     description: 'Varsayılan, tüm sitelerde olmalı' },
  seo:      { label: 'SEO++',     description: 'SEO odaklı siteler' },
  industry: { label: 'Endüstri+', description: 'Sanayi/endüstri müşterileri' },
  full:     { label: 'Full',      description: 'Maksimum özellik' },
};

/** Bir preset'e ait plugin name'lerini döndürür. `full` tüm plugin'leri içerir. */
export function getPluginsForPreset(preset: PluginPreset): string[] {
  return PLUGIN_REGISTRY
    .filter((p) => preset === 'full' || p.preset === preset)
    .map((p) => p.name);
}

export const PLUGIN_REGISTRY: PluginManifest[] = [
  {
    name: 'service-calculator',
    description: 'Hizmet sayfalarında metrekare bazlı fiyat hesaplayıcısı ekler',
    hooks: ['content:before-render', 'content:inject-section'],
    priority: 25,
    preset: 'industry',
  },
  {
    name: 'project-timeline',
    description: 'Proje zaman çizelgesi oluşturur',
    hooks: ['pseo:build-blocks', 'reference_timeline'],
    priority: 10,
    preset: 'core',
  },
  {
    name: 'seo-aeo',
    description: 'AEO summary bloğu ve SEO schema üretir',
    hooks: ['aeo_summary_block', 'aeo:optimize-faq', 'aeo:build-speakable', 'seo:build-schema'],
    priority: 20,
    preset: 'seo',
  },
  {
    name: 'zemin-checkup',
    description: 'Zemin kontrol widget\'ı ekler',
    hooks: ['pseo:build-blocks'],
    priority: 10,
    preset: 'industry',
  },
  {
    name: 'sektorler',
    description: 'Sektörler Sayfası modülü',
    hooks: ['content:before-render'],
    priority: 20,
    preset: 'core',
  },
];
