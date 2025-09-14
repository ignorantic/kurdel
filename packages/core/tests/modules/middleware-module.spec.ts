import { describe, it, expect, vi } from 'vitest';
import { MiddlewareRegistry } from '../../src/middleware-registry.js';
import { MiddlewareModule } from '../../src/modules/middleware-module.js';
import { errorHandler } from '../../src/middlewares/error-handle.js';

describe('MiddlewareModule', () => {
  it('should register global middlewares from config', async () => {
    const mw = vi.fn();

    const ioc = { bind: vi.fn(() => ({ toInstance: vi.fn() })) } as any;

    const registry = { use: vi.fn() } as unknown as MiddlewareRegistry;
    vi.spyOn(MiddlewareRegistry.prototype, 'use').mockImplementation(registry.use);

    const module = new MiddlewareModule();
    await module.register(ioc, { middlewares: [mw] });

    expect(registry.use).toHaveBeenCalledWith(mw);
    expect(registry.use).toHaveBeenCalledWith(errorHandler);

    vi.restoreAllMocks();
  });
});
