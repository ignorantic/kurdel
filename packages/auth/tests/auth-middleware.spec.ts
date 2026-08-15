import {
  AuthStrategyRegistry,
  AuthorizationPolicyRegistry,
  createAuthMiddleware,
} from '../src/index.js';

describe('createAuthMiddleware', () => {
  it('reports an unknown configured strategy as a server error', async () => {
    const middleware = createAuthMiddleware(new AuthStrategyRegistry());
    const response = { status: 500, body: { error: "Unknown auth strategy 'missing'" } };
    const ctx = {
      route: { auth: { strategy: 'missing' } },
      json: vi.fn(() => response),
    } as any;
    const next = vi.fn();

    await expect(middleware(ctx, next)).resolves.toBe(response);
    expect(ctx.json).toHaveBeenCalledWith(500, response.body);
    expect(next).not.toHaveBeenCalled();
  });

  it('bypasses authentication for public routes', async () => {
    const middleware = createAuthMiddleware(new AuthStrategyRegistry());
    const ctx = { route: { auth: { public: true } } } as any;
    const next = vi.fn(async () => undefined);

    await middleware(ctx, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('attaches the full auth context and keeps ctx.user compatible', async () => {
    const registry = new AuthStrategyRegistry();
    registry.register('api-key', {
      authenticate: vi.fn(async () => ({
        user: { id: 7, roles: ['admin'] },
        credential: { id: 'key-1', type: 'api-key' },
        claims: { tenant: 'demo' },
      })),
    });
    const middleware = createAuthMiddleware(registry);
    const ctx = {
      route: { auth: { strategy: 'api-key', roles: ['admin'] } },
      req: { method: 'GET', url: '/', query: {}, headers: {} },
      json: vi.fn(),
    } as any;
    const next = vi.fn(async () => undefined);

    await middleware(ctx, next);

    expect(ctx.auth).toEqual({
      strategy: 'api-key',
      user: { id: 7, roles: ['admin'] },
      credential: { id: 'key-1', type: 'api-key' },
      claims: { tenant: 'demo' },
    });
    expect(ctx.user).toBe(ctx.auth.user);
    expect(next).toHaveBeenCalledOnce();
  });

  it('grants access when every required policy succeeds', async () => {
    const strategies = new AuthStrategyRegistry();
    strategies.register('api-key', {
      authenticate: vi.fn(async () => ({
        user: { id: 7, roles: ['admin'] },
        credential: { id: 'key-1', type: 'api-key' },
      })),
    });
    const policies = new AuthorizationPolicyRegistry();
    const first = { authorize: vi.fn(() => true) };
    const second = { authorize: vi.fn(async () => true) };
    policies.register('first', first);
    policies.register('second', second);
    const middleware = createAuthMiddleware(strategies, policies);
    const ctx = {
      route: { auth: { strategy: 'api-key', policies: ['first', 'second'] } },
      req: { method: 'GET', url: '/', query: {}, headers: {} },
      json: vi.fn(),
    } as any;
    const next = vi.fn(async () => undefined);

    await middleware(ctx, next);

    expect(first.authorize).toHaveBeenCalledWith(ctx.auth, ctx);
    expect(second.authorize).toHaveBeenCalledWith(ctx.auth, ctx);
    expect(next).toHaveBeenCalledOnce();
  });

  it('denies access when a required policy rejects the request', async () => {
    const strategies = new AuthStrategyRegistry();
    strategies.register('api-key', {
      authenticate: vi.fn(async () => ({ user: { id: 7, roles: ['admin'] } })),
    });
    const policies = new AuthorizationPolicyRegistry();
    policies.register('denied', { authorize: vi.fn(() => false) });
    const response = { status: 403, body: { error: 'Forbidden' } };
    const ctx = {
      route: { auth: { strategy: 'api-key', policies: ['denied'] } },
      req: { method: 'GET', url: '/', query: {}, headers: {} },
      json: vi.fn(() => response),
    } as any;
    const next = vi.fn();

    await expect(createAuthMiddleware(strategies, policies)(ctx, next)).resolves.toBe(response);
    expect(ctx.json).toHaveBeenCalledWith(403, response.body);
    expect(next).not.toHaveBeenCalled();
  });

  it('reports an unknown authorization policy as a server error', async () => {
    const strategies = new AuthStrategyRegistry();
    strategies.register('api-key', {
      authenticate: vi.fn(async () => ({ user: { id: 7, roles: [] } })),
    });
    const response = {
      status: 500,
      body: { error: "Unknown authorization policy 'missing'" },
    };
    const ctx = {
      route: { auth: { strategy: 'api-key', policies: ['missing'] } },
      req: { method: 'GET', url: '/', query: {}, headers: {} },
      json: vi.fn(() => response),
    } as any;
    const next = vi.fn();

    await expect(createAuthMiddleware(strategies)(ctx, next)).resolves.toBe(response);
    expect(ctx.json).toHaveBeenCalledWith(500, response.body);
    expect(next).not.toHaveBeenCalled();
  });
});
