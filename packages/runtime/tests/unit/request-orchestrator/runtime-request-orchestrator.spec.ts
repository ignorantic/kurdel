/**
 * RuntimeRequestOrchestrator — Full Unit Test Suite
 *
 * Covers:
 *   1️⃣ 404 fallback
 *   2️⃣ PRE middleware short-circuit
 *   3️⃣ Controller execution + render
 *   4️⃣ POST middleware only after successful render
 *   5️⃣ Skip POST when render fails
 *   6️⃣ ERROR middleware when controller throws
 *   7️⃣ Error fallback when ERROR middleware does not handle
 *   8️⃣ ControllerActionMissingResultError (undefined return)
 *   9️⃣ FINAL middleware always runs
 */

import { describe, it, expect, vi } from 'vitest';

import type { HttpRequest, HttpResponse } from '@kurdel/common';

import { RuntimeRequestOrchestrator } from 'src/http/runtime-request-orchestrator.js';
import { TestController } from 'tests/utils/test-controller.js';
import { makeFakeMiddlewareRegistry, mw } from 'tests/utils/fake-middleware-registry.js';
import { makeMockRenderer, makeMockRouter } from 'tests/utils/mock-makers.js';

//
// Helpers
//

const makeReq = (over: Partial<HttpRequest> = {}): HttpRequest => ({
  method: 'GET',
  url: '/test',
  body: undefined,
  query: {},
  ...over,
});

const makeRes = (): HttpResponse => ({
  sent: false,
  statusCode: 200,
  end: vi.fn().mockImplementation(function (this: HttpResponse) {
    (this as any).sent = true;
  }),
  send: vi.fn().mockImplementation(function (this: HttpResponse) {
    (this as any).sent = true;
  }),
} as any);

const makeMatch = (over: any = {}) => ({
  params: {},
  query: {},
  body: undefined,
  schema: {},
  controller: undefined,
  action: undefined,
  ...over,
});

const build = (opts: any = {}) => {
  const router = opts.router ?? makeMockRouter(opts.match ?? null);
  const renderer = opts.renderer ?? makeMockRenderer();
  const registry = opts.registry ?? makeFakeMiddlewareRegistry();
  const scope = opts.scope ?? {};

  const orchestrator = new RuntimeRequestOrchestrator(
    router,
    renderer,
    registry,
  );

  return { orchestrator, router, renderer, registry, scope };
};

//
// --------------------------------
//  S U I T E   S T A R T S   H E R E
// --------------------------------
//

describe('RuntimeRequestOrchestrator', () => {
  // 1️⃣ — 404 fallback
  it('returns 404 if no route matched', async () => {
    const { orchestrator, renderer } = build({ match: null });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(renderer.handleError).toHaveBeenCalled();
    expect(res.sent).toBe(true);
  });

  // 2️⃣ — PRE short-circuit
  it('runs PRE middleware and short-circuits', async () => {
    const pre = mw(
      async () => ({ kind: 'text', status: 200, body: 'PRE' }),
      { zone: 'pre' },
    );
    const registry = makeFakeMiddlewareRegistry({ global: { pre: [pre] } });

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

  // 3️⃣ — Controller → Render
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

  // 4️⃣ — POST only after successful render
  it('runs POST only after successful render', async () => {
    const postSpy = vi.fn();
    const post = mw(async () => {
      postSpy();
      return undefined;
    }, { zone: 'post' });

    const registry = makeFakeMiddlewareRegistry({ global: { post: [post] } });

    const match = makeMatch({
      controller: new TestController({}),
      action: 'ok',
    });

    const { orchestrator } = build({ match, registry });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(postSpy).toHaveBeenCalled();
  });

  // 5️⃣ — Skip POST when render fails
  it('skips POST if render failed early', async () => {
    const postSpy = vi.fn();
    const post = mw(() => postSpy(), { zone: 'post' });

    const registry = makeFakeMiddlewareRegistry({ global: { post: [post] } });

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

    expect(postSpy).not.toHaveBeenCalled();
  });

  // 6️⃣ — ERROR middleware when controller throws
  it('executes ERROR middleware when controller throws', async () => {
    const errSpy = vi.fn();
    const errMw = mw(async () => {
      errSpy();
      return { kind: 'text', status: 500, body: 'ERR-MW' };
    }, { zone: 'error' });

    const registry = makeFakeMiddlewareRegistry({ global: { error: [errMw] } });

    const match = makeMatch({
      controller: new TestController({}),
      action: 'throws',
    });

    const { orchestrator, renderer } = build({ match, registry });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(errSpy).toHaveBeenCalled();
    expect(renderer.render).toHaveBeenCalledWith(
      res,
      expect.objectContaining({ body: 'ERR-MW' }),
    );
  });

  // 7️⃣ — Fallback if ERROR middleware does not handle
  it('falls back to renderer.handleError if ERROR middleware does not handle', async () => {
    const registry = makeFakeMiddlewareRegistry({ global: { error: [] } });

    const match = makeMatch({
      controller: new TestController({}),
      action: 'throws',
    });

    const { orchestrator, renderer } = build({ match, registry });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(renderer.handleError).toHaveBeenCalled();
  });

  // 8️⃣ — ControllerActionMissingResultError
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

  // 9️⃣ — FINAL always runs
  it('runs FINAL middleware regardless of outcome', async () => {
    const finalSpy = vi.fn();
    const final = mw(() => finalSpy(), { zone: 'final' });

    const registry = makeFakeMiddlewareRegistry({ global: { final: [final] } });

    const match = makeMatch({
      controller: new TestController({}),
      action: 'ok',
    });

    const { orchestrator } = build({ match, registry });
    const req = makeReq();
    const res = makeRes();

    await orchestrator.execute(req, res, {} as any);

    expect(finalSpy).toHaveBeenCalled();
  });
});
