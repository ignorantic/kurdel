import { describe, it, expect } from 'vitest';
import type { AppModule } from '@kurdel/core/app';
import { RuntimeComposer } from 'src/app/runtime-composer.js';

describe('RuntimeComposer.sortByPriority', () => {
  it('should order modules by ascending priority value', () => {
    const modA: AppModule = { priority: 50 };
    const modB: AppModule = { priority: 10 };
    const modC: AppModule = { priority: 30 };

    const result: AppModule[] = RuntimeComposer['sortByPriority']([modA, modB, modC]);

    expect(result).toEqual([modB, modC, modA]);
  });

  it('should preserve declaration order for equal priorities', () => {
    const modA: AppModule = { priority: 20 };
    const modB: AppModule = { priority: 20 };
    const modC: AppModule = { priority: 20 };

    const result: AppModule[] = RuntimeComposer['sortByPriority']([modA, modB, modC]);

    expect(result).toEqual([modA, modB, modC]);
  });

  it('should fall back to DEFAULT_PRIORITIES for built-in modules', () => {
    class LifecycleModule {}
    class ServerModule {}

    const lifecycle = new (LifecycleModule as any)();
    const server = new (ServerModule as any)();

    const result: AppModule[] = RuntimeComposer['sortByPriority']([server, lifecycle]);

    // LifecycleModule (prio 10) should precede ServerModule (prio 70)
    expect(result[0].constructor.name).toBe('LifecycleModule');
    expect(result[1].constructor.name).toBe('ServerModule');
  });

  it('should use default priority 100 for unknown modules', () => {
    const modA: AppModule = {};
    const modB: AppModule = { priority: 10 };

    const result: AppModule[] = RuntimeComposer['sortByPriority']([modA, modB]);

    // Module with explicit priority 10 should go first
    expect(result).toEqual([modB, modA]);
  });

  it('should not mutate the input array', () => {
    const modA: AppModule = { priority: 1 };
    const modB: AppModule = { priority: 2 };
    const modules = [modB, modA];

    const result: AppModule[] = RuntimeComposer['sortByPriority'](modules);

    expect(result).not.toBe(modules);
    expect(modules).toEqual([modB, modA]);
  });
});
