/**
 * HookRegistry type definitions for ERTEM hook system.
 * Provides typed hook infrastructure for filter/action pattern.
 */

type HookCallback<TArgs extends any[] = any[], TReturn = any> = (
  ...args: TArgs
) => TReturn;

type FilterCallback<T, TArgs extends any[] = any[]> = (
  value: T,
  ...args: TArgs
) => T;

type ActionCallback<TArgs extends any[] = any[]> = (
  ...args: TArgs
) => void;

export interface HookDefinition {
  name: string;
  description: string;
  params: string[];
  returns: string;
  category: HookCategory;
  since?: string;
}

export type HookCategory =
  | 'data'
  | 'content'
  | 'seo'
  | 'aeo'
  | 'template'
  | 'cache';

interface HookContext {
  hookName: string;
  timestamp: number;
  args: any[];
}

interface FilterChain<T, TArgs extends any[] = any[]> {
  value: T;
  args: TArgs;
  hooks: number;
  apply: () => T;
}

/**
 * Service container interface for dependency injection.
 */
interface ServiceContainer {
  register<T>(name: string, factory: () => T): void;
  resolve<T>(name: string): T | undefined;
  reset(): void;
}

/**
 * Standard interface for all system modules (plugins/themes)
 */
interface SystemModule {
  /** Uniquely identifies the module */
  slug: string;
  /** Registers the hooks and components (runs on every load) */
  initPlugin?: (options?: any) => void;
  register?: (options?: any) => void;
  /** Runs once when the plugin is activated via DB */
  install?: () => Promise<void> | void;
  /** Runs once when the plugin is deactivated or uninstalled via DB */
  uninstall?: () => Promise<void> | void;
}
