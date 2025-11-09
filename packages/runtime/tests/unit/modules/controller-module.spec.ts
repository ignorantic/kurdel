import { describe, it, expect, vi } from 'vitest';
import { TOKENS } from '@kurdel/core/tokens';
import { Controller, type MiddlewareRegistry } from '@kurdel/core/http';

import { ControllerModule } from 'src/modules/controller-module.js';

describe('ControllerModule', () => {
  it('should provide Router and ControllerConfigs', () => {
    class TestController extends Controller<any> {
      readonly routes = {};
    }

    const module = new ControllerModule([{ use: TestController }]);

    const routerProvider = module.providers.find(p => p.provide === TOKENS.Router);
    const configsProvider = module.providers.find(p => p.provide === TOKENS.ControllerConfigs);

    expect(routerProvider).toBeDefined();
    expect(configsProvider).toBeDefined();
    expect(configsProvider?.useInstance).toContainEqual({ use: TestController });
  });

  it('should register controller-level middlewares', async () => {
    const mw = vi.fn();

    class TestController extends Controller<any> {
      readonly routes = {};
    }

    const fakeRegistry = {
      useFor: vi.fn(),
      all: vi.fn(() => []),
      for: vi.fn(() => []),
    } as unknown as MiddlewareRegistry;

    const fakeRouter = { init: vi.fn() };

    const fakeIoc = {
      get: vi.fn(token => {
        if (token === TOKENS.MiddlewareRegistry) return fakeRegistry;
        if (token === TOKENS.Router) return fakeRouter;
        return undefined;
      }),
      bind: vi.fn(() => ({
        toConstantValue: vi.fn(),
        toInstance: vi.fn(),
      })),
      has: vi.fn(() => false),
    };

    const module = new ControllerModule([{ use: TestController, middlewares: [mw] }]);

    await module.register(fakeIoc as any);

    expect(fakeRegistry.useFor).toHaveBeenCalledWith(
      TestController,
      mw,
      expect.objectContaining({ zone: 'pre', priority: 0 })
    );
  });
});
