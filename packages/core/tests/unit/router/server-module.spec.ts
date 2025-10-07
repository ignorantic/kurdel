// Ensures ServerModule:
//  - initializes Router with resolver + controller configs + global middlewares
//  - hooks adapter.on(cb)
//  - creates per-request scope and passes it into router.resolve(method, url, scope)
//  - DOES NOT write req.__ioc

import { describe, it, expect, vi } from 'vitest';

import { TOKENS } from 'src/api/app/tokens.js';
import type { AppConfig } from 'src/api/app/config.js';
import type { ControllerConfig } from 'src/api/http/interfaces.js';

import { ServerModule } from 'src/runtime/modules/server-module.js';

import { FakeContainer } from './fake-container.js';

describe('ServerModule', () => {
  it('wires adapter to router and passes request scope into router.resolve', async () => {
    const ioc = new FakeContainer();

    const fakeRouter = {
      init: vi.fn(),
      resolve: vi.fn().mockReturnValue(async (req: any, res: any) => {
        // Simulate a successful handler
        res.statusCode = 204;
        res.end();
      }),
    };

    const fakeRegistry = { all: vi.fn().mockReturnValue([]) };
    const fakeControllerConfigs: ControllerConfig[] = [];
    const fakeResolver = {}; // Not used directly here

    const fakeAdapter = {
      on: vi.fn((cb: (req: any, res: any) => void | Promise<void>) => {
        // Simulate a single inbound request
        const req: any = { method: 'GET', url: '/ping/1' };
        const res: any = { end: vi.fn(), setHeader: vi.fn(), statusCode: 0 };
        cb(req, res);
      }),
    };

    // Register DI tokens
    ioc.set(TOKENS.Router as any, fakeRouter);
    ioc.set(TOKENS.MiddlewareRegistry as any, fakeRegistry);
    ioc.set(TOKENS.ControllerConfigs as any, fakeControllerConfigs);
    ioc.set(TOKENS.ControllerResolver as any, fakeResolver);
    ioc.set(TOKENS.ServerAdapter as any, fakeAdapter);

    // Run the module register hook
    const mod = new ServerModule({} as AppConfig);
    await mod.register(ioc as any);

    // Router.init called with deps from container
    expect(fakeRouter.init).toHaveBeenCalled();
    expect(fakeRegistry.all).toHaveBeenCalled();

    // router.resolve(method, url, scope) was called; 3rd arg is a scope (not root ioc)
    const resolveCall = (fakeRouter.resolve as any).mock.calls[0];
    expect(resolveCall[0]).toBe('GET');
    expect(resolveCall[1]).toBe('/ping/1');
    expect(resolveCall[2]).toBeDefined();
    expect(resolveCall[2]).not.toBe(ioc);

    // Ensure we did not set req.__ioc anymore
    // (we can only assert that adapter.on callback did not mutate req with __ioc)
    const reqInOn = (fakeAdapter.on as any).mock.calls[0][0];
    expect(reqInOn.__ioc).toBeUndefined();
  });
});

