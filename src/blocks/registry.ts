import { BlockTypeDefinition, BlockTypeRegistration } from './types';

// ---------------------------------------------------------------------------
// STATIC BLOCK COMPONENT MAP
// Turbopack/webpack: import() içinde dinamik değişken kullanılamaz.
// Tüm block component'leri burada statik olarak tanımlanmalı.
// Yeni bir block eklendiğinde buraya da eklenmeli.
// ---------------------------------------------------------------------------
const BLOCK_COMPONENT_LOADERS: Record<string, () => Promise<any>> = {
  '@/blocks/components/TextImageBlock':      () => import('@/blocks/components/TextImageBlock'),
  '@/blocks/components/IframeBlock':         () => import('@/blocks/components/IframeBlock'),
  '@/blocks/components/ComponentRefBlock':   () => import('@/blocks/components/ComponentRefBlock'),
  '@/blocks/components/PageRefBlock':        () => import('@/blocks/components/PageRefBlock'),
  '@/blocks/components/FaqBlock':            () => import('@/blocks/components/FaqBlock'),
  '@/blocks/components/CheckupBlock':        () => import('@/blocks/components/CheckupBlock'),
};

export class BlockTypeRegistry {
  private static instance: BlockTypeRegistry;
  private types = new Map<string, BlockTypeDefinition>();

  static getInstance(): BlockTypeRegistry {
    if (!BlockTypeRegistry.instance) {
      BlockTypeRegistry.instance = new BlockTypeRegistry();
    }
    return BlockTypeRegistry.instance;
  }

  register(def: BlockTypeRegistration): void {
    this.types.set(def.typeKey, {
      typeKey: def.typeKey,
      componentPath: def.componentPath,
      defaultProps: def.defaultProps,
      category: def.category,
      active: def.active,
    });
  }

  get(typeKey: string): BlockTypeDefinition | null {
    return this.types.get(typeKey) || null;
  }

  getAll(): BlockTypeDefinition[] {
    return Array.from(this.types.values()).filter(t => t.active);
  }

  has(typeKey: string): boolean {
    return this.types.has(typeKey);
  }

  async getRenderer(typeKey: string): Promise<React.ComponentType<any> | null> {
    const def = this.types.get(typeKey);
    if (!def || !def.componentPath) return null;

    // Statik map'ten loader al (Turbopack uyumlu)
    const loader = BLOCK_COMPONENT_LOADERS[def.componentPath];
    if (!loader) {
      console.warn(`[BlockRegistry] No static loader for: ${def.componentPath}. Add it to BLOCK_COMPONENT_LOADERS.`);
      return null;
    }

    try {
      const mod = await loader();
      return mod.default || mod[Object.keys(mod)[0]] || null;
    } catch (error) {
      console.error(`Failed to load block component for ${typeKey}:`, error);
      return null;
    }
  }

  clear(): void {
    this.types.clear();
  }
}

export const blockRegistry = BlockTypeRegistry.getInstance();
