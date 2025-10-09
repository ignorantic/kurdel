import { describe, it, expect, vi } from 'vitest';

import { RuntimeMiddlewareRegistry } from 'src/http/runtime-middleware-registry.js';
import { MiddlewareModule } from 'src/modules/middleware-module.js';

describe('MiddlewareModule', () => {
  it('should register global middlewares from config', async () => {
    const mw = vi.fn();

    const registry = { use: vi.fn() } as unknown as RuntimeMiddlewareRegistry;
    const ioc = {
      get: vi.fn(() => registry),
      bind: vi.fn(() => ({ toInstance: vi.fn() })),
    } as any;

    vi.spyOn(RuntimeMiddlewareRegistry.prototype, 'use').mockImplementation(registry.use);

    const module = new MiddlewareModule([mw]);
    await module.register(ioc);

    expect(registry.use).toHaveBeenCalledWith(mw);

    vi.restoreAllMocks();
  });
});
