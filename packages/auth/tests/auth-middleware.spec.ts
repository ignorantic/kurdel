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
});
