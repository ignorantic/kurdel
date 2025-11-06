import { describe, it, expect } from 'vitest';
import type { ActionResult, HttpContext, RouteConfig } from 'src/http/index.js';
import { route, Controller } from 'src/http/index.js';

// Simple pure controller used to verify different ActionResult kinds.
class UsersController extends Controller {
  readonly routes: RouteConfig = {
    index: route({ method: 'GET', path: '/users' })(this.index),
    redirect: route({ method: 'GET', path: '/redirect' })(this.redirect),
    empty: route({ method: 'GET', path: '/empty' })(this.empty),
    boom: route({ method: 'GET', path: '/boom' })(this.boom),
  };

  async index(ctx: HttpContext): Promise<ActionResult> {
    return { kind: 'json', status: 200, body: { ok: true, q: ctx.query } };
  }

  async redirect(): Promise<ActionResult> {
    return { kind: 'redirect', status: 302, location: '/target' };
  }

  async empty(): Promise<ActionResult> {
    return { kind: 'empty', status: 204 };
  }

  async boom(): Promise<ActionResult> {
    throw new Error('Unexpected');
  }

  // private helper not registered in routes
  _helper() {
    return 'secret';
  }
}

// Create a minimal fake HttpContext (no Node, no runtime)
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

// Helper to execute an action directly and capture its result or error.
async function execAction(ctrl: Controller, action: string, url = '/users?role=admin') {
  const ctx = makeCtx(url);
  try {
    const result = await ctrl.handle(action, ctx);
    return result;
  } catch (err) {
    // Simulate runtime’s fallback for unhandled exceptions
    return { kind: 'json', status: 500, body: { error: 'Internal Server Error' } };
  }
}

describe('Controller.handle (pure, runtime-free)', () => {
  it('returns JSON 200 from index()', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, 'index', '/users?role=admin');

    expect(result.kind).toBe('json');
    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(result.body.q.role).toBe('admin');
  });

  it('returns 404 for unknown action', async () => {
    const ctrl = new UsersController({});
    await expect(ctrl.handle('missingAction', makeCtx('/users'))).rejects.toThrow(
      "Action 'missingAction' not found"
    );
  });

  it('does not expose helper methods as actions', async () => {
    const ctrl = new UsersController({});
    await expect(ctrl.handle('_helper', makeCtx('/users'))).rejects.toThrow(
      "Action '_helper' not found"
    );
  });

  it('returns redirect result correctly', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, 'redirect', '/redirect');
    expect(result.kind).toBe('redirect');
    expect(result.status).toBe(302);
    expect(result.location).toBe('/target');
  });

  it('returns empty 204 result', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, 'empty', '/empty');
    expect(result.kind).toBe('empty');
    expect(result.status).toBe(204);
  });

  it('maps thrown error to 500 result', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, 'boom', '/boom');
    expect(result.kind).toBe('json');
    expect(result.status).toBe(500);
    expect(result.body.error).toContain('Internal Server Error');
  });
});
