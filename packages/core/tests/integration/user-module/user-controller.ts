import { Controller } from 'src/api/controller.js';
import { BadRequest, Ok, Created } from 'src/api/http-results.js';
import { HttpContext } from 'src/api/types.js';
import { route } from '../../../src/api/routing.js';

import { UserService } from './user-service.js';

type Deps = { userService: UserService };

export class UserController extends Controller<Deps> {
  readonly routes = {
    list: route({ method: 'GET', path: '/' })(this.list),
    create: route({ method: 'POST', path: '/' })(this.create),
  };

  async list(ctx: HttpContext<Deps>) {
    return Ok(ctx.deps.userService.findAll())
  }

  async create(ctx: HttpContext<Deps>) {
    const body = ctx.body as { name: string };

    if (!body) {
      throw BadRequest('Request body is required');
    }

    const name = body.name;
    if (!name) {
      throw BadRequest('Field `name` is required');
    }

    return Created(ctx.deps.userService.create(name));
  }
}

