import type { AuthStrategy, AuthStrategyProvider } from '../src/index.js';
import {
  AuthModule,
  AuthStrategyRegistry,
} from '../src/index.js';

describe('AuthModule', () => {
  it('provides only the strategy registry', () => {
    const module = new AuthModule();

    expect(module.providers).toHaveLength(1);
    expect(module.providers[0]).toMatchObject({
      useClass: AuthStrategyRegistry,
      singleton: true,
    });
    expect(String(module.providers[0].provide)).toBe('Symbol(AuthStrategyRegistry)');
  });

  it('registers instance and factory strategies plus the auth middleware', async () => {
    const registry = new AuthStrategyRegistry();
    const middlewareRegistry = { use: vi.fn() };
    const ioc = {
      get: vi.fn((token) => {
        if (String(token) === 'Symbol(AuthStrategyRegistry)') return registry;
        if (String(token) === 'Symbol(@kurdel/core/http:middleware-registry)') {
          return middlewareRegistry;
        }
        throw new Error(`Unexpected token: ${String(token)}`);
      }),
    } as any;
    const instance: AuthStrategy = { authenticate: vi.fn(async () => null) };
    const fromFactory: AuthStrategy = { authenticate: vi.fn(async () => null) };
    const factory = vi.fn(() => fromFactory);
    const strategies: AuthStrategyProvider[] = [
      { name: 'instance', use: instance },
      { name: 'factory', useFactory: factory },
    ];

    await new AuthModule({ strategies }).register(ioc);

    expect(registry.get('instance')).toBe(instance);
    expect(registry.get('factory')).toBe(fromFactory);
    expect(factory).toHaveBeenCalledWith(ioc);
    expect(middlewareRegistry.use).toHaveBeenCalledWith(expect.any(Function), {
      zone: 'auth',
      priority: 0,
    });
  });

  it('works without strategy-specific services', async () => {
    const registry = new AuthStrategyRegistry();
    const middlewareRegistry = { use: vi.fn() };
    const ioc = {
      get: vi.fn((token) => {
        if (String(token) === 'Symbol(AuthStrategyRegistry)') return registry;
        if (String(token) === 'Symbol(@kurdel/core/http:middleware-registry)') {
          return middlewareRegistry;
        }
        throw new Error(`Unexpected token: ${String(token)}`);
      }),
    } as any;

    await expect(new AuthModule().register(ioc)).resolves.toBeUndefined();
    expect(middlewareRegistry.use).toHaveBeenCalledOnce();
  });
});
