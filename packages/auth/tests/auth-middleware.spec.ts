import {
  AuthStrategyRegistry,
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
});
