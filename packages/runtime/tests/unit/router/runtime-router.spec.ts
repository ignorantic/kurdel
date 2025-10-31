// RouterImpl behaviour:
//  - Compiles routes from a temporary instance (root) during init
//  - On resolve(method, url, scope) uses the provided scope to construct controller
//  - Extracts params into req.__params for Controller.execute()
//  - Applies global middlewares
//  - Returns null when no route matches

import { describe, it, expect, vi } from 'vitest';
import type { Method, ControllerConfig, Middleware } from '@kurdel/core/http';

import { RuntimeRouter } from 'src/http/runtime-router.js';

import { FakeContainer } from './fake-container.js';
import { FakeResolver } from './fake-resolver.js';
import { FakeController } from './fake-controller.js';
import { FakeResponseRenderer } from './fake-response-renderer.js';

function makeRouter(configs: ControllerConfig[], mws: Middleware[] = []) {
  const root = new FakeContainer();
  const resolver = new FakeResolver(root);
  const renderer = new FakeResponseRenderer();

  root.set(FakeController as any, new FakeController({ tag: 'root', calls: [] }));

  const router = new RuntimeRouter();

  mws.forEach(mw => router.use(mw));

  router.init({
    resolver,
    renderer,
    middlewares: [],
    controllerConfigs: configs,
  });

  return { router, root };
}

describe('RuntimeRouter', () => {
  it('resolves handler and uses the provided request scope', async () => {
    const configs: ControllerConfig[] = [{ use: FakeController, prefix: '' }];

    // Global middleware that records invocation order
    const globalCalls: string[] = [];
    const globalMw: Middleware = async (ctx, next) => {
      globalCalls.push('g1');
      return next();
    };

    const { router, root } = makeRouter(configs, [globalMw]);

    // Create a request scope with its own controller instance
    const scope = root.createScope();
    const calls: string[] = [];
    scope.set(FakeController as any, new FakeController({ tag: 'scopeA', calls }));

    const handler = router.resolve('GET' as Method, '/ping/42', scope)!;
    expect(handler).toBeTypeOf('function');

    const req: any = { method: 'GET', url: '/ping/42' };

    const res: any = {
      statusCode: 200,
      headersSent: false,
      body: undefined as any,
      json: vi.fn(),
      status: vi.fn(function (this: any, code) {
        this.statusCode = code;
        return this;
      }),
      send: vi.fn(function (this: any, body) {
        this.body = body;
        return this;
      }),
      redirect: vi.fn(function (this: any, code, location) {
        this.statusCode = code;
        this.location = location;
        return this;
      }),
    };

    await handler(req, res);

    // Assert the controller from SCOPE was used (not the root)
    expect(calls).toContain('ping:42:scopeA');

    // Global middleware executed
    expect(globalCalls).toEqual(['g1']);

    // JSON response was rendered
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  it('returns a 404 handler when no route matches', async () => {
    const { router, root } = makeRouter([{ use: FakeController }], []);
    const scope = root.createScope();
    scope.set(FakeController as any, new FakeController({ tag: 'S', calls: [] }));

    const handler = router.resolve('GET' as Method, '/unknown', scope);
    expect(typeof handler).toBe('function');

    // simulate HttpRequest/HttpResponse
    const req = { method: 'GET', url: '/unknown' } as any;
    const res = {
      sent: false,
      statusCode: 0,
      body: '',
      status: vi.fn(function (this: any, code: number) {
        this.statusCode = code;
        return this;
      }),
      send: vi.fn(function (this: any, body?: any) {
        this.body = body ?? '';
        this.sent = true;
        return this;
      }),
      json: vi.fn(function (this: any, body?: any) {
        return this.send(JSON.stringify(body));
      }),
      redirect: vi.fn(function (this: any, code, location) {
        this.statusCode = code;
        this.location = location;
        return this;
      }),
    };

    await handler!(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toContain('404');
    expect(res.sent).toBe(true);
  });

  it('extracts path params and exposes them via req.__params', async () => {
    const { router, root } = makeRouter([{ use: FakeController }], []);
    const calls: string[] = [];
    const scope = root.createScope();
    scope.set(FakeController as any, new FakeController({ tag: 'S', calls }));

    const handler = router.resolve('GET' as Method, '/ping/abc', scope)!;

    const req: any = { method: 'GET', url: '/ping/abc' };

    const res: any = {
      statusCode: 200,
      headersSent: false,
      body: undefined as any,
      json: vi.fn(),
      status: vi.fn(function (this: any, code) {
        this.statusCode = code;
        return this;
      }),
      send: vi.fn(function (this: any, body) {
        this.body = body;
        return this;
      }),
      redirect: vi.fn(function (this: any, code, location) {
        this.statusCode = code;
        this.location = location;
        return this;
      }),
    };

    await handler(req, res);

    // Indirectly verifies params were parsed and used by the controller
    expect(calls[0]).toBe('ping:abc:S');
  });
});
