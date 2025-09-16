import { Controller, route, Ok, Created, BadRequest } from '@kurdel/core';
import type { ActionResult, HttpContext, RouteConfig } from '@kurdel/core/http/types';

export class UserController extends Controller {
  readonly routes: RouteConfig = {
    list: route({ method: 'GET', path: '/users' })(this.list),
    create: route({ method: 'POST', path: '/users' })(this.create),
    fail: route({ method: 'GET', path: '/users/error' })(this.fail),
  };

  async list(ctx: HttpContext): Promise<ActionResult> {
    return Ok([{ id: 1, name: 'Alice' }]);
  }

  async create(ctx: HttpContext<{},{ name: string }>): Promise<ActionResult> {
    const { name } = ctx.body ?? {};
    if (typeof name !== 'string') {
      throw BadRequest('Name is required');
    }
    return Created({ id: 2, name });
  }

  async fail(ctx: HttpContext): Promise<ActionResult> {
    throw BadRequest('Bad request test');
  }
}

