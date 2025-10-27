import type {
  RouteConfig,
  HttpContext,
  ActionResult,
  RouteParams} from '@kurdel/core/http';
import { Controller, route } from '@kurdel/core/http';

import type { UserService } from './user-service.js';

type Deps = {
  service: UserService;
};

export class UserController extends Controller<Deps> {
  readonly routes: RouteConfig = {
    getOne: route({ method: 'GET', path: '/:id' })(this.getOne),
    getAll: route({ method: 'GET', path: '/' })(this.getAll),
  };

  async getOne(ctx: HttpContext<unknown, RouteParams<'/:id'>>): Promise<ActionResult> {
    const { id } = ctx.params;

    if (typeof id !== 'string') {
      return this.render('403.ejs', { message: 'ID is required' }, 404);
    }

    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return this.render('403.ejs', { message: 'ID must be a number' }, 404);
    }

    const record = await this.deps.service.getUser(userId);
    if (!record) {
      return this.render('404.ejs', { message: 'User not found' }, 404);
    }

    return this.render('user.ejs', { user: record });
  }

  async getAll(): Promise<ActionResult> {
    const records = await this.deps.service.getUsers();
    return this.render('user-list.ejs', { records });
  }
}
