import { describe, it, expect, beforeEach } from 'vitest';

import { Controller } from 'src/api/controller.js';
import { ActionResult, HttpContext, RouteConfig } from 'src/api/http/types.js';

import { createReqRes } from '../utils/http.js';

// simple deferred helper
function deferred<T = void>() {
  let resolve!: (v: T | PromiseLike<T>) => void;
  let reject!: (e?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

class RaceController extends Controller<{}> {
  // shared sync points for deterministic interleaving
  static started = deferred<void>();
  static release = deferred<void>();
  static startedCount = 0;

  // IMPORTANT: map action name directly to the handler function
  readonly routes: RouteConfig<{}> = {
    slow: this.slow,
  };

  // stateless handler: returns ActionResult and uses ctx
  async slow(ctx: HttpContext<{}>): Promise<ActionResult> {
    // signal when both requests reached this point
    RaceController.startedCount += 1;
    if (RaceController.startedCount === 2) {
      RaceController.started.resolve();
    }

    // wait for test to release both handlers at once
    await RaceController.release.promise;

    return { kind: 'json', status: 200, body: { q: ctx.query } };
  }
}

async function exec<TDeps>(ctrl: Controller<TDeps>, action: string, url: string) {
  const { req, res, getResult } = createReqRes(url, 'GET');
  await ctrl.execute(req, res, action);
  return getResult();
}

beforeEach(() => {
  // reset sync primitives before each test
  RaceController.started = deferred<void>();
  RaceController.release = deferred<void>();
  RaceController.startedCount = 0;
});

describe('Controller parallel execution (stateless)', () => {
  it('handles two concurrent requests on the same instance without state races', async () => {
    const ctrl = new RaceController({});

    const p1 = exec(ctrl, 'slow', '/users/slow?tag=A');
    const p2 = exec(ctrl, 'slow', '/users/slow?tag=B');

    // wait until both handlers reached the barrier; add a safety timeout to avoid hanging the test
    await Promise.race([
      RaceController.started.promise,
      new Promise((_, rej) => setTimeout(() => rej(new Error('barrier not reached')), 2000)),
    ]);

    // release both
    RaceController.release.resolve();

    const [r1, r2] = await Promise.all([p1, p2]);

    // both should be proper JSON responses now
    expect((r1.headers['content-type'] ?? '')).toContain('application/json');
    expect((r2.headers['content-type'] ?? '')).toContain('application/json');

    const b1 = JSON.parse(r1.body);
    const b2 = JSON.parse(r2.body);

    expect(b1.q.tag).toBe('A');
    expect(b2.q.tag).toBe('B');
  });
});
