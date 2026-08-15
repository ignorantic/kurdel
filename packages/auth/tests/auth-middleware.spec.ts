import {
  AuthStrategyRegistry,
  AuthorizationPolicyRegistry,
  createAuthMiddleware,
} from '../src/index.js';

describe('createAuthMiddleware', () => {
  const occurredAt = new Date('2026-08-15T12:00:00.000Z');
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

  it('reports sanitized authentication success and failure events', async () => {
    const strategies = new AuthStrategyRegistry();
    strategies.register('api-key', {
      authenticate: vi.fn(async req => req.headers?.['x-api-key'] === 'valid-secret'
        ? {
            user: { id: 7, roles: ['admin'] },
            credential: { id: 'key-1', type: 'api-key' },
          }
        : null),
    });
    const events = { report: vi.fn(async () => undefined) };
    const middleware = createAuthMiddleware(
      strategies,
      new AuthorizationPolicyRegistry(),
      events,
      () => occurredAt,
    );
    const next = vi.fn(async () => undefined);
    const context = (key: string) => ({
      route: { auth: { strategy: 'api-key' } },
      req: { method: 'GET', url: '/', query: {}, headers: { 'x-api-key': key } },
      json: vi.fn(() => ({ status: 401 })),
    }) as any;

    await middleware(context('valid-secret'), next);
    await middleware(context('invalid-secret'), next);

    expect(events.report).toHaveBeenNthCalledWith(1, {
      type: 'authentication.succeeded',
      occurredAt,
      strategy: 'api-key',
      userId: 7,
      credential: { id: 'key-1', type: 'api-key' },
    });
    expect(events.report).toHaveBeenNthCalledWith(2, {
      type: 'authentication.failed',
      occurredAt,
      strategy: 'api-key',
      reason: 'invalid-credential',
    });
    expect(JSON.stringify(events.report.mock.calls)).not.toContain('valid-secret');
    expect(JSON.stringify(events.report.mock.calls)).not.toContain('invalid-secret');
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
    const events = { report: vi.fn(async () => undefined) };
    const response = { status: 403, body: { error: 'Forbidden' } };
    const ctx = {
      route: { auth: { strategy: 'api-key', policies: ['denied'] } },
      req: { method: 'GET', url: '/', query: {}, headers: {} },
      json: vi.fn(() => response),
    } as any;
    const next = vi.fn();

    await expect(createAuthMiddleware(
      strategies,
      policies,
      events,
      () => occurredAt,
    )(ctx, next)).resolves.toBe(response);
    expect(ctx.json).toHaveBeenCalledWith(403, response.body);
    expect(events.report).toHaveBeenLastCalledWith({
      type: 'authorization.denied',
      occurredAt,
      strategy: 'api-key',
      userId: 7,
      reason: 'policy-rejected',
      policy: 'denied',
    });
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
