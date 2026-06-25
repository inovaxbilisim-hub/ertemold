/**
 * HookRegistry — A WordPress-style Event and Filter system for ERTEM pSEO
 *
 * Allows modules to register blocks, inject content, or modify data
 * without modifying the core files.
 *
 * Supports:
 * - Typed filter/action overloads (generic)
 * - Async-safe applyFilters (sync + async callbacks)
 * - Error isolation (one failing hook doesn't break the chain)
 * - Namespaced hooks (pseo:, seo:, aeo:, cache:, content:, template:)
 * - Priority-based ordering
 * - Legacy backward compat (pseo_blocks, head_elements)
 */

type Callback = (...args: any[]) => any;

interface Hook {
  name: string;
  callback: Callback;
  priority: number;
}

class Registry {
  private filters: Record<string, Hook[]> = {};
  private actions: Record<string, Hook[]> = {};

  /**
   * Registers a filter hook to modify data.
   * @param name Hook name (supports namespaced like 'pseo:build-blocks')
   * @param callback Filter function
   * @param priority Execution order (lower runs first, default 10)
   */
  addFilter<T = any>(
    name: string,
    callback: (value: T, ...args: any[]) => T,
    priority = 10,
  ): void {
    if (!this.filters[name]) this.filters[name] = [];
    this.filters[name].push({
      name,
      callback: callback as Callback,
      priority,
    });
    this.filters[name].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Applies all registered filters to the given value in priority order.
   * Supports both sync and async callbacks.
   * Error isolation: if one filter throws, it logs and continues.
   */
  async applyFiltersAsync<T = any>(
    name: string,
    value: T,
    ...args: any[]
  ): Promise<T> {
    if (!this.filters[name]) return value;

    let result: T = value;
    for (const hook of this.filters[name]) {
      try {
        result = await hook.callback(result, ...args);
      } catch (error) {
        console.error(
          `[HookRegistry] Error in filter '${name}' (priority ${hook.priority}):`,
          error,
        );
        // Continue with next hook — error isolation
      }
    }
    return result;
  }

  /**
   * Synchronous applyFilters — runs all callbacks synchronously.
   * If a callback returns a Promise, it will be kept as-is (caller handles).
   * Maintains backward compatibility.
   */
  applyFilters<T = any>(
    name: string,
    value: T,
    ...args: any[]
  ): T {
    if (!this.filters[name]) return value;

    let result: unknown = value;
    for (const hook of this.filters[name]) {
      try {
        result = hook.callback(result, ...args);
      } catch (error) {
        console.error(
          `[HookRegistry] Error in filter '${name}' (priority ${hook.priority}):`,
          error,
        );
        // Continue with next hook — error isolation
      }
    }
    return result as T;
  }

  /**
   * Registers an action hook to execute side effects.
   * @param name Hook name
   * @param callback Action function
   * @param priority Execution order (lower runs first, default 10)
   */
  addAction<TArgs extends any[] = any[]>(
    name: string,
    callback: (...args: TArgs) => void,
    priority = 10,
  ): void {
    if (!this.actions[name]) this.actions[name] = [];
    this.actions[name].push({
      name,
      callback: callback as Callback,
      priority,
    });
    this.actions[name].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Executes all registered actions in priority order.
   * Error isolation: if one action throws, it logs and continues.
   */
  doAction(name: string, ...args: any[]): void {
    if (!this.actions[name]) return;

    for (const hook of this.actions[name]) {
      try {
        hook.callback(...args);
      } catch (error) {
        console.error(
          `[HookRegistry] Error in action '${name}' (priority ${hook.priority}):`,
          error,
        );
        // Continue with next action — error isolation
      }
    }
  }

  /**
   * Async version of doAction — awaits each callback if it returns a promise.
   */
  async doActionAsync(name: string, ...args: any[]): Promise<void> {
    if (!this.actions[name]) return;

    for (const hook of this.actions[name]) {
      try {
        await hook.callback(...args);
      } catch (error) {
        console.error(
          `[HookRegistry] Error in action '${name}' (priority ${hook.priority}):`,
          error,
        );
      }
    }
  }

  /**
   * Removes a specific filter callback.
   */
  removeFilter(name: string, callback?: Callback): void {
    if (!this.filters[name]) return;
    if (callback) {
      this.filters[name] = this.filters[name].filter(
        (h) => h.callback !== callback,
      );
    } else {
      delete this.filters[name];
    }
  }

  /**
   * Removes a specific action callback.
   */
  removeAction(name: string, callback?: Callback): void {
    if (!this.actions[name]) return;
    if (callback) {
      this.actions[name] = this.actions[name].filter(
        (h) => h.callback !== callback,
      );
    } else {
      delete this.actions[name];
    }
  }

  /**
   * Returns all registered filter names.
   */
  getFilterNames(): string[] {
    return Object.keys(this.filters);
  }

  /**
   * Returns all registered action names.
   */
  getActionNames(): string[] {
    return Object.keys(this.actions);
  }

  /**
   * Clears all hooks for a specific name (useful for testing/HMR).
   */
  clear(name: string): void {
    delete this.filters[name];
    delete this.actions[name];
  }

  /**
   * Clears ALL hooks (useful for testing/HMR).
   */
  clearAll(): void {
    this.filters = {};
    this.actions = {};
  }
}

const HOOK_REGISTRY_KEY = '__ERTEM_HOOK_REGISTRY__' as const;
const globalAny = globalThis as unknown as Record<string, unknown>;

if (!globalAny[HOOK_REGISTRY_KEY]) {
  globalAny[HOOK_REGISTRY_KEY] = new Registry();
}

export const HookRegistry = globalAny[HOOK_REGISTRY_KEY] as Registry;
