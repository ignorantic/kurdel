import { describe, it, expect, vi } from 'vitest';

import type { Middleware } from '@kurdel/core/http';
import { MiddlewareModule } from 'src/modules/middleware-module.js';
import { errorHandler } from 'src/middlewares/error-handle.js';
import { jsonBodyParser } from 'src/middlewares/json-body-parser.js';

describe('MiddlewareModule', () => {
  it('should register default and user middlewares in correct order', async () => {
    const mw: Middleware = vi.fn(async (_, next) => next());

    // Fake IoC container and registry
    const registry = { use: vi.fn() };
    const ioc = { get: vi.fn(() => registry) } as any;

    // Create module with a single user middleware
    const module = new MiddlewareModule([{ use: mw, zone: 'pre', priority: 1 }]);
    await module.register(ioc);

    // Verify total calls: errorHandler, user, jsonBodyParser
    expect(registry.use).toHaveBeenCalledTimes(3);

    // 1️⃣ First — errorHandler (pre)
    expect(registry.use).toHaveBeenNthCalledWith(1, errorHandler, {
      zone: 'pre',
      priority: 0,
    });

    // 2️⃣ Second — user-provided middleware
    expect(registry.use).toHaveBeenNthCalledWith(2, mw, {
      zone: 'pre',
      priority: 1,
    });

    // 3️⃣ Third — jsonBodyParser (post)
    expect(registry.use).toHaveBeenNthCalledWith(3, jsonBodyParser, {
      zone: 'post',
      priority: 0,
    });
  });

  it('should apply default zone/priority when omitted', async () => {
    const mw: Middleware = vi.fn(async (_, next) => next());
    const registry = { use: vi.fn() };
    const ioc = { get: vi.fn(() => registry) } as any;

    // Missing zone/priority → should default
    const module = new MiddlewareModule([{ use: mw } as any]);
    await module.register(ioc);

    // Expected three total calls
    expect(registry.use).toHaveBeenCalledTimes(3);

    // Validate the user middleware (second call)
    const [, , postCall] = registry.use.mock.calls;
    const userCall = registry.use.mock.calls[1];

    expect(userCall).toEqual([mw, { zone: undefined, priority: undefined }]);

    // Confirm default middlewares still present
    expect(registry.use).toHaveBeenCalledWith(errorHandler, expect.any(Object));
    expect(registry.use).toHaveBeenCalledWith(jsonBodyParser, expect.any(Object));
  });
});
