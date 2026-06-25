/**
 * Available Hooks — Tüm hook'ları hangi plugin'lerin kullandığını gösteren map.
 * Her hook adı -> onu kullanan plugin isimleri listesi.
 *
 * TEK KAYNAK: PLUGIN_REGISTRY üzerinden dinamik olarak türetilir.
 * Manuel HOOK_PLUGIN_MAP kaldırıldı — registry ile senkronizasyon hatalarını önler.
 */
import { PLUGIN_REGISTRY } from './_registry';

/**
 * Hook adından plugin isimlerine dinamik harita.
 * _registry.ts'deki hooks[] dizisinden otomatik oluşturulur.
 */
export const HOOK_TO_PLUGINS: Record<string, string[]> = {};

for (const plugin of PLUGIN_REGISTRY) {
  for (const hook of plugin.hooks) {
    if (!HOOK_TO_PLUGINS[hook]) {
      HOOK_TO_PLUGINS[hook] = [];
    }
    HOOK_TO_PLUGINS[hook].push(plugin.name);
  }
}

/**
 * Tüm kayıtlı hook isimlerini döndürür.
 */
export function getAllRegisteredHooks(): string[] {
  return Object.keys(HOOK_TO_PLUGINS);
}

/**
 * Belirli bir hook'u kullanan plugin isimlerini döndürür.
 */
export function getPluginsForHook(hookName: string): string[] {
  return HOOK_TO_PLUGINS[hookName] || [];
}

/**
 * Belirli bir plugin'in kullandığı hook'ları döndürür.
 */
export function getHooksForPlugin(pluginName: string): string[] {
  return Object.entries(HOOK_TO_PLUGINS)
    .filter(([, plugins]) => plugins.includes(pluginName))
    .map(([hook]) => hook);
}
