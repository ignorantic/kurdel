import { z } from 'zod';
import type { RouteConfig, HttpContext, ActionResult, RouteParams } from '@kurdel/core/http';
import { Controller, route, NotFound, Ok, Created } from '@kurdel/core/http';

import type { UserModel } from './user-model.js';
import { zodAdapter } from './zod-adapter.js';

type Deps = {
  model: UserModel;
};

export class UserController extends Controller<Deps> {
  readonly routes: RouteConfig = {
    create: route({
      method: 'POST',
      path: '/',
      schema: {
        body: zodAdapter(
          z.object({
            name: z.string().min(2),
            role: z.string().min(2),
          })
        ),
      },
    })(this.create),

    getOne: route({
      method: 'GET',
      path: '/:id',
      schema: {
        params: zodAdapter(
          z.object({
            id: z.string().regex(/^\d+$/, 'id must be numeric'),
          })
        ),
      },
    })(this.getOne),

    getAll: route({ method: 'GET', path: '/' })(this.getAll),
  };

  async create(ctx: HttpContext<{ name: string; role: string }>): Promise<ActionResult> {
    const { name, role } = ctx.body!;

    await this.deps.model.createUser(name, role);
    return Created({ name, role });
  }

  async getOne(ctx: HttpContext<unknown, RouteParams<'/:id'>>): Promise<ActionResult> {
    const { id } = ctx.params;
    const record = await this.deps.model.getUser(Number(id));

    if (!record) {
      throw NotFound('User not found');
    }

    return Ok(record);
  }

  async getAll(): Promise<ActionResult> {
    const records = await this.deps.model.getUsers();
    return Ok(records);
  }
}
