import { Controller, route, Ok, Created, BadRequest } from '@kurdel/core';
import type { HttpContext } from '@kurdel/core';
import { UserService } from './user-service.js';

type Deps = { userService: UserService };

export class UserController extends Controller<Deps> {
  readonly routes = {
    list: route({ method: 'GET', path: '/users' })(
      async (ctx: HttpContext<Deps>) =>
        Ok(ctx.deps.userService.findAll())
    ),

    create: route({ method: 'POST', path: '/users' })(
      async (ctx: HttpContext<Deps>) => {
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
    ),
  };
}

