/**
 * ControllerModule — unit test suite
 *
 * Covers:
 *   1️⃣ Router / ControllerConfigs providers
 *   2️⃣ Controller-level middleware registration
 */

import { describe, it, expect, vi } from 'vitest';
import { Controller, type MiddlewareRegistry } from '@kurdel/core/http';
import type { InstanceProviderConfig } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';

import { ControllerModule } from 'src/modules/controller-module.js';

/** Minimal controller for testing provider registration */
class TestController extends Controller<any> {
  readonly routes = {};
}

describe('ControllerModule', () => {
  // 1️⃣ Provides Router + ControllerConfigs
  it('provides Router and ControllerConfigs', () => {
    const module = new ControllerModule([{ use: TestController }]);

    const routerProvider = module.providers.find(p => p.provide === TOKENS.Router);
    const configsProvider = module.providers.find(
      p => p.provide === TOKENS.ControllerConfigs,
    ) as InstanceProviderConfig;

    expect(routerProvider).toBeDefined();
    expect(configsProvider).toBeDefined();
    expect(configsProvider?.useInstance).toContainEqual({ use: TestController });
  });

  // 2️⃣ Registers controller-level middleware
  it('registers controller-level middlewares', async () => {
    const mw = vi.fn();

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

    const module = new ControllerModule([
      { use: TestController, middlewares: [mw] },
    ]);

    await module.register(fakeIoc as any);

    expect(fakeRegistry.useFor).toHaveBeenCalledWith(
      TestController,
      mw,
      expect.objectContaining({
        zone: 'pre',
        priority: 0,
      }),
    );
  });
});
