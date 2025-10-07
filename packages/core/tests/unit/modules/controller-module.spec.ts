import { describe, it, expect, vi } from 'vitest';

import { TOKENS } from 'src/api/app/tokens.js';
import { Controller } from 'src/api/http/controller.js';
import type { MiddlewareRegistry } from 'src/api/http/middleware-registry.js';

import { ControllerModule } from 'src/runtime/modules/controller-module.js';

describe('ControllerModule', () => {
  it('should provide Router and CONTROLLER_CLASSES', () => {
    class TestController extends Controller<{}> {
      readonly routes = {};
    }

    const module = new ControllerModule([{ use: TestController }]);

    const routerProvider = module.providers.find((p) => 'provide' in p);
    const controllersProvider = module.providers.find(
      (p) => 'provide' in p && p.provide === TOKENS.ControllerClasses
    );

    expect(routerProvider).toBeDefined();
    expect(controllersProvider?.useInstance).toContain(TestController);
  });

  it('should register local middlewares', async () => {
    const mw = vi.fn();
    class TestController extends Controller<{}> {
      readonly routes = {};
    }

    const fakeRegistry = { useFor: vi.fn(), all: () => [] } as unknown as MiddlewareRegistry;
    const fakeIoc = { get: () => fakeRegistry };

    const module = new ControllerModule([{ use: TestController, middlewares: [mw] }]);

    await module.register(fakeIoc as any);

    expect(fakeRegistry.useFor).toHaveBeenCalledWith(TestController, mw);
  });
});
