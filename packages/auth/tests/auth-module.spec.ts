import type {
  AuthStrategy,
  AuthStrategyProvider,
  AuthorizationPolicy,
  AuthorizationPolicyProvider,
} from '../src/index.js';
import {
  AuthModule,
  AuthStrategyRegistry,
  AuthorizationPolicyRegistry,
  NoopAuthEventSink,
} from '../src/index.js';

describe('AuthModule', () => {
  it('provides strategy and policy registries', () => {
    const module = new AuthModule();

    expect(module.providers).toHaveLength(3);
    expect(module.providers[0]).toMatchObject({
      useClass: AuthStrategyRegistry,
      singleton: true,
    });
    expect(String(module.providers[0].provide)).toBe('Symbol(AuthStrategyRegistry)');
    expect(module.providers[1]).toMatchObject({
      useClass: AuthorizationPolicyRegistry,
      singleton: true,
    });
    expect(String(module.providers[1].provide)).toBe('Symbol(AuthorizationPolicyRegistry)');
    expect(module.providers[2]).toMatchObject({
      useInstance: expect.any(NoopAuthEventSink),
    });
    expect(String(module.providers[2].provide)).toBe('Symbol(AuthEventSink)');
  });

  it('registers instance and factory strategies plus the auth middleware', async () => {
    const registry = new AuthStrategyRegistry();
    const policyRegistry = new AuthorizationPolicyRegistry();
    const eventSink = { report: vi.fn() };
    const middlewareRegistry = { use: vi.fn() };
    const ioc = {
      get: vi.fn((token) => {
        if (String(token) === 'Symbol(AuthStrategyRegistry)') return registry;
        if (String(token) === 'Symbol(AuthorizationPolicyRegistry)') return policyRegistry;
        if (String(token) === 'Symbol(AuthEventSink)') return eventSink;
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
    const policy: AuthorizationPolicy = { authorize: vi.fn(() => true) };
    const factoryPolicy: AuthorizationPolicy = { authorize: vi.fn(() => true) };
    const policyFactory = vi.fn(() => factoryPolicy);
    const policies: AuthorizationPolicyProvider[] = [
      { name: 'instance-policy', use: policy },
      { name: 'factory-policy', useFactory: policyFactory },
    ];

    await new AuthModule({ strategies, policies }).register(ioc);

    expect(registry.get('instance')).toBe(instance);
    expect(registry.get('factory')).toBe(fromFactory);
    expect(factory).toHaveBeenCalledWith(ioc);
    expect(policyRegistry.get('instance-policy')).toBe(policy);
    expect(policyRegistry.get('factory-policy')).toBe(factoryPolicy);
    expect(policyFactory).toHaveBeenCalledWith(ioc);
    expect(middlewareRegistry.use).toHaveBeenCalledWith(expect.any(Function), {
      zone: 'auth',
      priority: 0,
    });
  });

  it('works without strategy-specific services', async () => {
    const registry = new AuthStrategyRegistry();
    const policyRegistry = new AuthorizationPolicyRegistry();
    const eventSink = { report: vi.fn() };
    const middlewareRegistry = { use: vi.fn() };
    const ioc = {
      get: vi.fn((token) => {
        if (String(token) === 'Symbol(AuthStrategyRegistry)') return registry;
        if (String(token) === 'Symbol(AuthorizationPolicyRegistry)') return policyRegistry;
        if (String(token) === 'Symbol(AuthEventSink)') return eventSink;
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
