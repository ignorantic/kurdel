import { describe, it, expect, beforeEach } from 'vitest';

import type { ActionResult } from 'src/http/types.js';
import type { HttpContext } from 'src/http/http-context.js';
import type { RouteConfig } from 'src/http/route.js';
import { Controller } from 'src/http/controller.js';

// simple deferred helper used for deterministic synchronization
function deferred<T = void>() {
  let resolve!: (v: T | PromiseLike<T>) => void;
  let reject!: (e?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Stateless controller used to simulate concurrent requests.
class RaceController extends Controller {
  static started = deferred<void>();
  static release = deferred<void>();
  static startedCount = 0;

  readonly routes: RouteConfig = {
    slow: this.slow,
  };

  // Stateless handler that awaits a shared promise to simulate latency.
  async slow(ctx: HttpContext): Promise<ActionResult> {
    RaceController.startedCount += 1;
    if (RaceController.startedCount === 2) {
      RaceController.started.resolve();
    }

    await RaceController.release.promise;

    return { kind: 'json', status: 200, body: { q: ctx.query } };
  }
}

// Minimal fake context generator (no runtime, no Node bindings).
function makeCtx(url: string): HttpContext {
  const parsed = new URL(url, 'http://internal');
  const query: Record<string, string | string[]> = {};
  parsed.searchParams.forEach((v, k) => (query[k] = v));

  return {
    req: { method: 'GET', url, headers: {}, query, params: {} },
    res: {
      status: 200,
      sent: false,
      send: () => {},
      json: () => {},
      redirect: () => {},
      end: () => {},
    },
    url: parsed,
    query,
    params: {},
    deps: {},
    json(status, body) {
      return { kind: 'json', status, body };
    },
    text(status, body) {
      return { kind: 'text', status, body };
    },
    redirect(status, location) {
      return { kind: 'redirect', status, location };
    },
    noContent() {
      return { kind: 'empty', status: 204 };
    },
  };
}

async function exec(ctrl: Controller, action: string, url: string) {
  const ctx = makeCtx(url);
  return ctrl.handle(action, ctx);
}

beforeEach(() => {
  RaceController.started = deferred<void>();
  RaceController.release = deferred<void>();
  RaceController.startedCount = 0;
});

describe('Controller parallel execution (stateless)', () => {
  it('handles two concurrent requests on the same instance without state races', async () => {
    const ctrl = new RaceController({});

    // Start two requests concurrently.
    const p1 = exec(ctrl, 'slow', 'http://internal/users/slow?tag=A');
    const p2 = exec(ctrl, 'slow', 'http://internal/users/slow?tag=B');

    // Wait until both reached the barrier.
    await Promise.race([
      RaceController.started.promise,
      new Promise((_, rej) => setTimeout(() => rej(new Error('barrier not reached')), 2000)),
    ]);

    // Release both at the same time.
    RaceController.release.resolve();

    const [r1, r2] = await Promise.all([p1, p2]);

    // Both should be valid ActionResults.
    expect(r1.kind).toBe('json');
    expect(r2.kind).toBe('json');

    expect(r1.body.q.tag).toBe('A');
    expect(r2.body.q.tag).toBe('B');
  });
});
