import { describe, it, expect, vi } from 'vitest';
import { TOKENS } from '@kurdel/core/tokens';
import { Controller, type MiddlewareRegistry } from '@kurdel/core/http';

import { ControllerModule } from 'src/modules/controller-module.js';

describe('ControllerModule', () => {
  it('should provide Router and CONTROLLER_CLASSES', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    class TestController extends Controller<{}> {
      readonly routes = {};
    }

    const module = new ControllerModule([{ use: TestController }]);

    const routerProvider = module.providers.find(p => 'provide' in p);
    const controllersProvider = module.providers.find(
      p => 'provide' in p && p.provide === TOKENS.ControllerClasses
    );

    expect(routerProvider).toBeDefined();
    expect(controllersProvider?.useInstance).toContain(TestController);
  });

  it('should register local middlewares', async () => {
    const mw = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
