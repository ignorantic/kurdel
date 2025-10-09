import {
  Controller,
  RouteConfig,
  HttpContext,
  ActionResult,
  route,
  BadRequest,
  NotFound,
  Ok,
  RouteParams,
} from '@kurdel/core/http';
import { UserService } from '../services/user-service.js';

type Deps = {
  service: UserService
};

export class UserController extends Controller<Deps> {
  readonly routes: RouteConfig<Deps> = {
    getOne: route({ method: 'GET', path: '/:id' })(this.getOne),
    getAll: route({ method: 'GET', path: '/' })(this.getAll),
  };

  async getOne(ctx: HttpContext<Deps, {}, RouteParams<'/:id'>>): Promise<ActionResult> {
    const { id } = ctx.params;

    if (typeof id !== 'string') {
      throw BadRequest('ID is required');
    }

    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      throw BadRequest('ID must be a number');
    }

    const record = await ctx.deps.service.getUser(userId);
    if (!record) {
      throw NotFound('User not found');
    }

    return Ok(record);
  }

  async getAll(ctx: HttpContext<Deps>): Promise<ActionResult> {
    const records = await ctx.deps.service.getUsers();
    return Ok(records);
  }
}
