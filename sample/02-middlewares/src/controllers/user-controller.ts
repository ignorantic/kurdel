import {
  Controller,
  RouteConfig,
  HttpContext,
  ActionResult,
  route,
} from '@kurdel/core';
import { UserService } from '../services/user-service.js';

type Deps = UserService;

export class UserController extends Controller<Deps> {
  readonly routes: RouteConfig<Deps> = {
    getOne: route({ method: 'GET', path: '/user/:id' })(this.getOne),
    getAll: route({ method: 'GET', path: '/users' })(this.getAll),
  };

  async getOne(ctx: HttpContext<Deps>): Promise<ActionResult> {
    const { id } = ctx.params;

    if (typeof id !== 'string') {
      return { kind: 'json', status: 400, body: { error: 'Id not found' } };
    }

    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return { kind: 'json', status: 400, body: { error: 'Invalid id' } };
    }

    try {
      const record = await ctx.deps.getUser(userId);
      return { kind: 'json', status: 200, body: record };
    } catch (err) {
      return { kind: 'json', status: 500, body: { error: String(err) } };
    }
  }

  async getAll(ctx: HttpContext<Deps>): Promise<ActionResult> {
    try {
      const records = await ctx.deps.getUsers();
      return { kind: 'json', status: 200, body: records };
    } catch (err) {
      return { kind: 'json', status: 500, body: { error: String(err) } };
    }
  }
}
