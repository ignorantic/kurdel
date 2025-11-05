import { describe, it, expect, vi } from 'vitest';
import { TOKENS } from '@kurdel/core/tokens';
import { ServerModule } from 'src/modules/server-module.js';

describe('ServerModule', () => {
  it('should initialize router and attach handler to ServerAdapter', async () => {
    const fakeAdapter = { on: vi.fn() };
    const fakeRouter = { init: vi.fn(), resolve: vi.fn() };
    const registry = { all: vi.fn(() => []) };
    const controllerResolver = { resolve: vi.fn() };

    const ioc = {
      has: vi.fn(() => false),
      bind: vi.fn(() => ({ toInstance: vi.fn() })),
      get: vi.fn((token: any) => {
        switch (token) {
          case TOKENS.ServerAdapter:
            return fakeAdapter;
          case TOKENS.Router:
            return fakeRouter;
          case TOKENS.MiddlewareRegistry:
            return registry;
          case TOKENS.ControllerConfigs:
            return [];
          case TOKENS.ControllerResolver:
            return controllerResolver;
          case TOKENS.ResponseRenderer:
            return { render: vi.fn() };
          default:
            throw new Error(`Unexpected token: ${String(token)}`);
        }
      }),
    };

    const mod = new ServerModule();
    await mod.register(ioc as any);

    expect(fakeAdapter.on).toHaveBeenCalledTimes(1);
    expect(fakeRouter.init).toHaveBeenCalledTimes(1);
  });
});
