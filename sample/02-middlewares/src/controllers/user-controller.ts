import {
  Controller,
  RouteConfig,
  HttpContext,
  ActionResult,
  route,
  HttpError,
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
      throw new HttpError(400, 'ID is required');
    }

    const userId = Number(id);
    if (!Number.isFinite(userId)) {
    throw new HttpError(400, 'ID must be a number');
    }

    const record = await ctx.deps.getUser(userId);
    if (!record) {
      throw new HttpError(404, 'User not found');
    }

    return { kind: 'json', status: 200, body: record };
  }

  async getAll(ctx: HttpContext<Deps>): Promise<ActionResult> {
    const records = await ctx.deps.getUsers();
    return { kind: 'json', status: 200, body: records };
  }
}
