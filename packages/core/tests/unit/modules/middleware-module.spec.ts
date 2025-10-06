import { describe, it, expect, vi } from 'vitest';
import { MiddlewareRegistryImpl } from 'src/runtime/app/middleware-registry-impl.js';
import { MiddlewareModule } from 'src/runtime/modules/middleware-module.js';

describe('MiddlewareModule', () => {
  it('should register global middlewares from config', async () => {
    const mw = vi.fn();

    const registry = { use: vi.fn() } as unknown as MiddlewareRegistryImpl;
    const ioc = {
      get: vi.fn(() => registry),
      bind: vi.fn(() => ({ toInstance: vi.fn() })),
    } as any;

    vi.spyOn(MiddlewareRegistryImpl.prototype, 'use').mockImplementation(registry.use);

    const module = new MiddlewareModule([mw]);
    await module.register(ioc);

    expect(registry.use).toHaveBeenCalledWith(mw);

    vi.restoreAllMocks();
  });
});
