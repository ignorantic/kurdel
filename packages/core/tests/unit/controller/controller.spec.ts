import { describe, it, expect } from 'vitest';
import { Controller } from '../../../src/controller.js';
import type { RouteConfig, HttpContext, ActionResult } from '../../../src/types.js';
import { createReqRes } from '../utils/http.js';

class UsersController extends Controller<{}> {
  readonly routes: RouteConfig<{}> = {
    index: this.index,
  };

  async index(ctx: HttpContext<{}>): Promise<ActionResult> {
    return { kind: 'json', status: 200, body: { ok: true, q: ctx.query } };
  }

  // this is not exposed in routes, so it cannot be called
  _helper() { return 'secret'; }
}

async function execAction<TDeps>(ctrl: Controller<TDeps>, action: string, url = '/users?role=admin') {
  const { req, res, getResult } = createReqRes(url, 'GET');
  await ctrl.execute(req, res, action);
  return getResult();
}

describe('Controller', () => {
  it('calls existing action and sends JSON 200', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, 'index', '/users?role=admin');
    expect(result.statusCode).toBe(200);
    expect((result.headers['content-type'] ?? '')).toContain('application/json');
    const payload = JSON.parse(result.body);
    expect(payload.ok).toBe(true);
    expect(payload.q.role).toBe('admin');
  });

  it('returns 404 for unknown action', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, 'missingAction', '/users');
    expect(result.statusCode).toBe(404);
    expect(result.body).toContain(`The method 'missingAction'`);
  });

  it('does not allow calling helper methods as actions', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, '_helper', '/users');
    expect(result.statusCode).toBe(404);
  });
});
