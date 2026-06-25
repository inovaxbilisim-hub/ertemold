import { PLUGIN_REGISTRY, getPluginsForPreset, type PluginPreset } from '@/plugins/_registry';
import { dbAll } from '@/core/database/db';

const LOADED_PLUGINS_KEY = '__ERTEM_LOADED_PLUGINS__' as const;
const DB_PLUGINS_KEY = '__ERTEM_DB_PLUGINS__' as const;
const DB_PLUGINS_FETCHED = '__ERTEM_DB_PLUGINS_FETCHED__' as const;
const globalAny = globalThis as unknown as Record<string, any>;

if (!globalAny[LOADED_PLUGINS_KEY]) globalAny[LOADED_PLUGINS_KEY] = [];
if (!globalAny[DB_PLUGINS_KEY])     globalAny[DB_PLUGINS_KEY] = [];
if (!globalAny[DB_PLUGINS_FETCHED]) globalAny[DB_PLUGINS_FETCHED] = false;

const loadedPlugins = globalAny[LOADED_PLUGINS_KEY] as string[];
const registeredPluginNames = new Set(PLUGIN_REGISTRY.map((plugin) => plugin.name));

export type LoadActivePluginsOptions = {
  failFast?: boolean;
  fallbackPreset?: PluginPreset;
};

export async function loadActivePlugins(
  activePlugins: string[] | undefined = undefined,
  options: LoadActivePluginsOptions = {},
) {
  const { failFast = false, fallbackPreset } = options;

  let resolved: string[] = activePlugins ?? [];

  // DB-driven: system_modules tablosundan aktif eklentileri çek (ilk çağrıda)
  if (!globalAny[DB_PLUGINS_FETCHED]) {
    try {
      const dbModules = await dbAll<{ slug: string }>(
        'SELECT slug FROM system_modules WHERE is_active = true'
      );
      if (dbModules && dbModules.length > 0) {
        globalAny[DB_PLUGINS_KEY] = dbModules.map((m) => m.slug);
        console.log(`[PluginLoader] DB'den ${globalAny[DB_PLUGINS_KEY].length} plugin yüklendi`);
      }
    } catch (error) {
      console.error('[PluginLoader] DB sorgusu başarısız:', error);
    } finally {
      globalAny[DB_PLUGINS_FETCHED] = true;
    }
  }

  if (globalAny[DB_PLUGINS_KEY].length > 0) {
    resolved = globalAny[DB_PLUGINS_KEY] as string[];
  }

  if (!Array.isArray(resolved) || resolved.length === 0) {
    if (fallbackPreset) {
      resolved = getPluginsForPreset(fallbackPreset);
      console.log(`[PluginLoader] Fallback preset '${fallbackPreset}' → ${resolved.length} plugin`);
    } else {
      return;
    }
  }

  for (const pluginName of resolved) {
    if (typeof pluginName !== 'string') continue;

    // Zaten yüklü — atla
    if (loadedPlugins.includes(pluginName)) continue;

    if (!registeredPluginNames.has(pluginName)) {
      console.warn(`[PluginLoader] Bilinmeyen veya kaldırılmış plugin atlandı: ${pluginName}`);
      continue;
    }

    try {
      let pluginModule;
      try {
        pluginModule = await import(`@/modules/${pluginName}/index`);
      } catch {
        pluginModule = await import(`@/plugins/${pluginName}/index`);
      }

      if (pluginModule && typeof pluginModule.initPlugin === 'function') {
        pluginModule.initPlugin();
        loadedPlugins.push(pluginName);
        console.log(`[PluginLoader] Plugin yüklendi: ${pluginName}`);
      } else {
        const error = new Error(`Plugin '${pluginName}' initPlugin export etmiyor.`);
        console.error(`[PluginLoader] Geçersiz plugin '${pluginName}':`, error);
        if (failFast) throw error;
      }
    } catch (error) {
      console.error(`[PluginLoader] Plugin yüklenemedi: '${pluginName}'`, error);
      if (failFast) throw error instanceof Error ? error : new Error(String(error));
    }
  }
}

function resolvePreset(input: string | undefined | null): PluginPreset {
  const valid: PluginPreset[] = ['core', 'seo', 'industry', 'full'];
  if (input && valid.includes(input as PluginPreset)) return input as PluginPreset;
  return 'core';
}
