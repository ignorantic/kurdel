import { describe, it, expect } from 'vitest';

import { Controller } from 'src/api/http/controller.js';
import { ActionResult, HttpContext, RouteConfig } from 'src/api/http/types.js';
import { route } from 'src/api/http/route.js';

import { createReqRes } from '../utils/http.js';

class UsersController extends Controller<{}> {
  readonly routes: RouteConfig<{}> = {
    index: route({ method: 'GET', path: '/users' })(this.index),
    redirect: route({ method: 'GET', path: '/redirect' })(this.redirect),
    empty: route({ method: 'GET', path: '/empty' })(this.empty),
    boom: route({ method: 'GET', path: '/boom' })(this.boom),
  };

  async index(ctx: HttpContext<{}>): Promise<ActionResult> {
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

  it('should handle redirect', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, 'redirect', '/redirect');
    expect(result.statusCode).toBe(302);
    expect(result.headers.location).toContain('/target');
  });

  it('should handle empty result', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, 'empty', '/empty');
    expect(result.statusCode).toBe(204);
  });

  it('should map thrown error to 500 Internal Server Error', async () => {
    const ctrl = new UsersController({});
    const result = await execAction(ctrl, 'boom', '/boom');
    expect(result.body).toContain('Internal Server Error');
  });
});
