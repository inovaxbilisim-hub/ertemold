/**
 * ServiceContainer — Simple Dependency Injection container.
 * Supports singleton registration and resolution with HMR-safe reset.
 */

type Factory<T = any> = () => T;

interface ContainerEntry {
  instance: any;
  initialized: boolean;
}

class Container {
  private factories = new Map<string, Factory>();
  private instances = new Map<string, ContainerEntry>();

  /**
   * Register a service factory. Factory is lazy — called once on first resolve.
   */
  register<T>(name: string, factory: Factory<T>): void {
    if (this.factories.has(name)) {
      console.warn(`[ServiceContainer] Overwriting existing registration: ${name}`);
    }
    this.factories.set(name, factory);
    // Clear any previously cached instance so next resolve re-initializes
    this.instances.delete(name);
  }

  /**
   * Resolve a service by name. Returns the singleton instance.
   */
  resolve<T>(name: string): T | undefined {
    const entry = this.instances.get(name);
    if (entry?.initialized) {
      return entry.instance as T;
    }

    const factory = this.factories.get(name);
    if (!factory) {
      console.warn(`[ServiceContainer] No factory registered for: ${name}`);
      return undefined;
    }

    const instance = factory();
    this.instances.set(name, { instance, initialized: true });
    return instance as T;
  }

  /**
   * Check if a service is registered.
   */
  has(name: string): boolean {
    return this.factories.has(name);
  }

  /**
   * Reset the container — clears all registrations and instances.
   * Useful for HMR to prevent stale state.
   */
  reset(): void {
    this.factories.clear();
    this.instances.clear();
  }
}

const SERVICE_CONTAINER_KEY = '__ERTEM_SERVICE_CONTAINER__' as const;
const globalAny = globalThis as Record<string, unknown>;

if (!globalAny[SERVICE_CONTAINER_KEY]) {
  globalAny[SERVICE_CONTAINER_KEY] = new Container();
}

export const serviceContainer = globalAny[SERVICE_CONTAINER_KEY] as Container;
