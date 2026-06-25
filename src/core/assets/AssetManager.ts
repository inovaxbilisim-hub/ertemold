/**
 * Asset Manager - WordPress wp_enqueue benzeri sistem
 * Stil ve script dosyalarını dependency management ile yükler
 */

export interface StyleAsset {
  handle: string;
  src: string;
  deps: string[];
  media: string;
  version?: string;
}

export interface ScriptAsset {
  handle: string;
  src: string;
  deps: string[];
  inFooter: boolean;
  version?: string;
  async?: boolean;
  defer?: boolean;
}

class AssetManagerClass {
  private styles: Map<string, StyleAsset> = new Map();
  private scripts: Map<string, ScriptAsset> = new Map();
  
  /**
   * Stil dosyası kuyruğa ekle
   */
  enqueueStyle(
    handle: string,
    src: string,
    deps: string[] = [],
    media: string = 'all',
    version?: string
  ): void {
    this.styles.set(handle, {
      handle,
      src,
      deps,
      media,
      version,
    });
  }

  /**
   * Script dosyası kuyruğa ekle
   */
  enqueueScript(
    handle: string,
    src: string,
    deps: string[] = [],
    inFooter: boolean = true,
    version?: string,
    options?: { async?: boolean; defer?: boolean }
  ): void {
    this.scripts.set(handle, {
      handle,
      src,
      deps,
      inFooter,
      version,
      async: options?.async,
      defer: options?.defer,
    });
  }

  /**
   * Stil kuyruğundan kaldır
   */
  dequeueStyle(handle: string): void {
    this.styles.delete(handle);
  }

  /**
   * Script kuyruğundan kaldır
   */
  dequeueScript(handle: string): void {
    this.scripts.delete(handle);
  }

  /**
   * Dependency resolution ile stil sıralaması
   */
  getOrderedStyles(): StyleAsset[] {
    return this.topologicalSort(Array.from(this.styles.values()), 'style');
  }

  /**
   * Dependency resolution ile script sıralaması
   */
  getOrderedScripts(inFooter: boolean): ScriptAsset[] {
    const scripts = Array.from(this.scripts.values()).filter(
      (s) => s.inFooter === inFooter
    );
    return this.topologicalSort(scripts, 'script');
  }

  /**
   * Topological sort for dependency resolution
   */
  private topologicalSort<T extends { handle: string; deps: string[] }>(
    assets: T[],
    _type: 'style' | 'script'
  ): T[] {
    const sorted: T[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const assetMap = new Map(assets.map((a) => [a.handle, a]));

    const visit = (handle: string): void => {
      if (visited.has(handle)) return;
      if (visiting.has(handle)) {
        console.warn(`[AssetManager] Circular dependency detected: ${handle}`);
        return;
      }

      visiting.add(handle);

      const asset = assetMap.get(handle);
      if (asset) {
        // Visit dependencies first
        for (const dep of asset.deps) {
          visit(dep);
        }
        sorted.push(asset);
      }

      visiting.delete(handle);
      visited.add(handle);
    };

    // Visit all assets
    for (const asset of assets) {
      visit(asset.handle);
    }

    return sorted;
  }

  /**
   * Stil tag'lerini oluştur
   */
  renderStyleTags(): string {
    const styles = this.getOrderedStyles();
    return styles
      .map((style) => {
        const version = style.version ? `?v=${style.version}` : '';
        return `<link rel="stylesheet" href="${style.src}${version}" media="${style.media}" />`;
      })
      .join('\n');
  }

  /**
   * Script tag'lerini oluştur
   */
  renderScriptTags(inFooter: boolean): string {
    const scripts = this.getOrderedScripts(inFooter);
    return scripts
      .map((script) => {
        const version = script.version ? `?v=${script.version}` : '';
        const async = script.async ? ' async' : '';
        const defer = script.defer ? ' defer' : '';
        return `<script src="${script.src}${version}"${async}${defer}></script>`;
      })
      .join('\n');
  }

  /**
   * Tüm asset'leri temizle
   */
  clear(): void {
    this.styles.clear();
    this.scripts.clear();
  }

  /**
   * Kayıtlı asset sayısını döndür
   */
  getStats(): { styles: number; scripts: number } {
    return {
      styles: this.styles.size,
      scripts: this.scripts.size,
    };
  }
}

// Singleton instance
export const assetManager = new AssetManagerClass();

// Global erişim için (debugging)
if (typeof window !== 'undefined') {
  (window as any).__ASSET_MANAGER__ = assetManager;
}
