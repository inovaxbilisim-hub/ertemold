import { describe, it, expect, beforeEach } from 'vitest';

describe('HookRegistry', () => {
  let HookRegistry: any;

  beforeEach(async () => {
    // Clear any existing global state
    delete (globalThis as any).__ERTEM_HOOK_REGISTRY__;
    const mod = await import('./HookRegistry');
    HookRegistry = mod.HookRegistry;
  });

  it('should register and apply filters', () => {
    HookRegistry.addFilter('test:filter', (value: string) => value.toUpperCase());
    const result = HookRegistry.applyFilters('test:filter', 'hello');
    expect(result).toBe('HELLO');
  });

  it('should call filters in priority order', () => {
    const order: number[] = [];
    HookRegistry.addFilter('test:priority', (value: number) => {
      order.push(1);
      return value + 1;
    }, 20);
    HookRegistry.addFilter('test:priority', (value: number) => {
      order.push(2);
      return value + 10;
    }, 10);

    const result = HookRegistry.applyFilters('test:priority', 0);
    expect(result).toBe(11);
    expect(order).toEqual([2, 1]);
  });

  it('should isolate errors in filters', () => {
    HookRegistry.addFilter('test:error', (_value: string) => {
      throw new Error('boom');
    });
    HookRegistry.addFilter('test:error', (value: string) => value + ' ok');

    const result = HookRegistry.applyFilters('test:error', 'start');
    expect(result).toBe('start ok');
  });

  it('should support async filters', async () => {
    HookRegistry.addFilter('test:async', async (value: number) => {
      return value + 1;
    });
    HookRegistry.addFilter('test:async', (value: number) => {
      return value * 2;
    });

    const result = await HookRegistry.applyFiltersAsync('test:async', 1);
    expect(result).toBe(4);
  });

  it('should register and execute actions', () => {
    const calls: string[] = [];
    HookRegistry.addAction('test:action', (msg: string) => {
      calls.push(msg);
    });
    HookRegistry.doAction('test:action', 'fired');
    expect(calls).toEqual(['fired']);
  });

  it('should support removing filters', () => {
    const cb = (value: string) => value + ' removed';
    HookRegistry.addFilter('test:remove', cb);
    HookRegistry.removeFilter('test:remove', cb);
    const result = HookRegistry.applyFilters('test:remove', 'value');
    expect(result).toBe('value');
  });

  it('should clear all hooks', () => {
    HookRegistry.addFilter('test:clear', (value: string) => value + 'x');
    HookRegistry.clearAll();
    const result = HookRegistry.applyFilters('test:clear', 'value');
    expect(result).toBe('value');
  });
});
