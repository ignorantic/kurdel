import { Controller, Ok, Created, BadRequest, route } from '@kurdel/core/http';

import type { HttpContext } from '@kurdel/core/http';

import type { UserService } from './user-service.js';

type Deps = { userService: UserService };

export class UserController extends Controller<Deps> {
  readonly routes = {
    list: route({ method: 'GET', path: '/' })(this.list),
    create: route({ method: 'POST', path: '/' })(this.create),
  };

  async list() {
    return Ok(this.deps.userService.findAll());
  }

  async create(ctx: HttpContext) {
    const body = ctx.body as { name: string };

    if (!body) {
      throw BadRequest('Request body is required');
    }

    const name = body.name;
    if (!name) {
      throw BadRequest('Field `name` is required');
    }

    return Created(this.deps.userService.create(name));
  }
}
