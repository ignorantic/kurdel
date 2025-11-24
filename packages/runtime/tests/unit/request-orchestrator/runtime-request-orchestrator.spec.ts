import { describe, it, expect, vi } from 'vitest';

import type { HttpRequest, HttpResponse } from '@kurdel/common';
import { type Router, type MiddlewareRegistry, type ActionResult, Controller, route } from '@kurdel/core/http';

import { RuntimeRequestOrchestrator } from 'src/http/runtime-request-orchestrator.js';

//
// Test doubles
//

const makeReq = (over: Partial<HttpRequest> = {}): HttpRequest => ({
  method: 'GET',
  url: '/test',
  body: undefined,
  query: {},
  ...over,
});

const makeRes = (): HttpResponse => {
  return {
    sent: false,
    statusCode: 200,
    end: vi.fn().mockImplementation(function () {
      (this as any).sent = true;
    }),
    send: vi.fn().mockImplementation(function () {
      (this as any).sent = true;
    }),
  } as any;
};

const makeRenderer = () => ({
  render: vi.fn((res: HttpResponse, result: ActionResult) => {
    res.sent = true;
    res.send?.(JSON.stringify(result));
  }),
  handleError: vi.fn((res: HttpResponse, err: any) => {
    res.sent = true;
    res.send?.(JSON.stringify({ error: err.message ?? 'err' }));
  }),
});

const makeMatch = (over: any = {}) => ({
  params: {},
  query: {},
  body: undefined,
  schema: {},
  controller: undefined,
  action: undefined,
  ...over,
});

const makeRouter = (match: any) =>
  ({
    resolve: vi.fn().mockReturnValue(match),
  }) as unknown as Router;

const makeRegistry = (zones: Record<string, any[]> = {}) =>
  ({
    all: (zone: string) => zones[zone] ?? [],
    for: () => [],
  }) as unknown as MiddlewareRegistry;

//
// Fake middleware builder
//
const mw = (fn: (ctx: any) => any) => ({ use: fn });

//
// Fake controller
//
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class TestController extends Controller<{}> {
  readonly routes = {
    ok: route({ path: '/ok', method: 'GET' })(this.ok),
    throws: route({ path: '/throws', method: 'GET' })(this.throws),
    undefined: route({ path: '/undefined', method: 'GET' })(this.undefinedReturn),
  };

  async ok() {
    return { kind: 'text', status: 200, body: 'OK' };
  }

  async throws() {
    throw new Error('boom');
  }

  async undefinedReturn() {
    return undefined;
  }
}

//
// Build orchestrator
//
const build = (opts: any = {}) => {
  const router = opts.router ?? makeRouter(opts.match ?? null);
  const renderer = opts.renderer ?? makeRenderer();
  const registry = opts.registry ?? makeRegistry();
  const scope = opts.scope ?? {};
  const orchestrator = new RuntimeRequestOrchestrator(router, renderer, registry);
  return { orchestrator, router, renderer, registry, scope };
};

//
// TESTS
//
describe('RuntimeRequestOrchestrator', () => {
  it('returns 404 if no route matched', async () => {
    const { orchestrator, renderer } = build({ match: null });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(renderer.handleError).toHaveBeenCalled();
    expect(res.sent).toBe(true);
  });

  it('runs PRE middleware and short-circuits', async () => {
    const pre = mw(() => ({ kind: 'text', status: 200, body: 'PRE' }));
    const registry = makeRegistry({ pre: [pre] });

    const match = makeMatch({
      controller: new TestController({}),
      action: 'ok',
    });

    const { orchestrator, renderer } = build({ match, registry });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(renderer.render).toHaveBeenCalledWith(
      res,
      expect.objectContaining({ body: 'PRE' }),
    );
  });

  it('executes controller and renders result', async () => {
    const match = makeMatch({
      controller: new TestController({}),
      action: 'ok',
    });

    const { orchestrator, renderer } = build({ match });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(renderer.render).toHaveBeenCalledWith(
      res,
      expect.objectContaining({ body: 'OK' }),
    );
  });

  it('runs POST only after successful render', async () => {
    const postFn = vi.fn();
    const post = mw(() => {
      postFn();
      return undefined;
    });

    const registry = makeRegistry({ post: [post] });

    const match = makeMatch({
      controller: new TestController({}),
      action: 'ok',
    });

    const { orchestrator } = build({ match, registry });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(postFn).toHaveBeenCalled();
  });

  it('skips POST if render failed early', async () => {
    const postFn = vi.fn();
    const post = mw(() => postFn());

    const registry = makeRegistry({ post: [post] });

    const renderer = {
      render: vi.fn(() => {
        throw new Error('render fail');
      }),
      handleError: vi.fn((res: HttpResponse) => {
        res.sent = true;
      }),
    };

    const match = makeMatch({
      controller: new TestController({}),
      action: 'ok',
    });

    const { orchestrator } = build({ match, registry, renderer });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(postFn).not.toHaveBeenCalled();
  });

  it('executes ERROR middleware when controller throws', async () => {
    const errMwFn = vi.fn();
    const errMw = mw((ctx: any) => {
      errMwFn();
      return { kind: 'text', status: 500, body: 'ERR-MW' };
    });

    const registry = makeRegistry({ error: [errMw] });

    const match = makeMatch({
      controller: new TestController({}),
      action: 'throws',
    });

    const { orchestrator, renderer } = build({ match, registry });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(errMwFn).toHaveBeenCalled();
    expect(renderer.render).toHaveBeenCalledWith(
      res,
      expect.objectContaining({ body: 'ERR-MW' }),
    );
  });

  it('falls back to renderer.handleError if ERROR middleware does not handle', async () => {
    const registry = makeRegistry({ error: [] });

    const match = makeMatch({
      controller: new TestController({}),
      action: 'throws',
    });

    const { orchestrator, renderer } = build({ match });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(renderer.handleError).toHaveBeenCalled();
  });

  it('throws ControllerActionMissingResultError when controller returns undefined', async () => {
    const match = makeMatch({
      controller: new TestController({}),
      action: 'undefined',
    });

    const { orchestrator, renderer } = build({ match });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(renderer.handleError).toHaveBeenCalled();
  });

  it('runs FINAL middleware regardless of outcome', async () => {
    const finalFn = vi.fn();
    const final = mw(() => finalFn());

    const registry = makeRegistry({ final: [final] });

    const match = makeMatch({
      controller: new TestController({}),
      action: 'ok',
    });

    const { orchestrator } = build({ match, registry });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(finalFn).toHaveBeenCalled();
  });
});
