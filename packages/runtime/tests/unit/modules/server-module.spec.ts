import { describe, it, expect } from 'vitest';
import { TOKENS } from '@kurdel/core/tokens';

import { ServerModule } from 'src/modules/server-module.js';

const fakeAdapter = {
  on: vi.fn(),
  listen: vi.fn(),
  close: vi.fn(),
};

const toInstance = vi.fn();
const ioc = {
  bind: vi.fn(() => ({ toInstance })),
  get: vi.fn(() => ({ toInstance })),
  has: vi.fn(),
} as any;

const registry = { all: () => [] };

ioc.get = vi.fn((token: any) => {
  switch (token) {
    case TOKENS.MiddlewareRegistry:
      return registry;
    case TOKENS.Router:
      return { init: vi.fn(), resolve: vi.fn() };
    case TOKENS.ControllerConfigs:
      return [];
    case TOKENS.ControllerResolver:
      return { resolve: vi.fn() };
    case TOKENS.ServerAdapter:
      return fakeAdapter;
  }
});

describe('ServerModule', () => {
  it('should provide IServerAdapter with default server', async () => {
    const module = new ServerModule({ serverAdapter: fakeAdapter });
    await module.register(ioc);

    const hasServerProvider = module.providers.some(
      p => 'provide' in p && p.provide === TOKENS.ServerAdapter
    );

    expect(hasServerProvider).toBe(true);
  });
});
