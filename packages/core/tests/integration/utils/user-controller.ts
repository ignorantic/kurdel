import { Controller } from '../../../src/controller.ts';
import type { ActionResult, HttpContext } from '../../../src/types.ts';
import { ROUTE_META } from '../../../src/routing.ts';

export class UserController extends Controller {
  readonly routes = {
    list: Object.assign(
      async (ctx: HttpContext): Promise<ActionResult> => ({
        kind: 'json',
        status: 200,
        body: [{ id: 1, name: 'Alice' }],
      }),
      { [ROUTE_META]: { method: 'GET', path: '/users' } }
    ),

    create: Object.assign(
      async (ctx: HttpContext): Promise<ActionResult> => ({
        kind: 'json',
        status: 201,
        body: { id: 2, name: 'Bob' },
      }),
      { [ROUTE_META]: { method: 'POST', path: '/users' } }
    ),

    fail: Object.assign(
      async (ctx: HttpContext): Promise<ActionResult> => {
        throw new Error('Bad request test');
      },
      { [ROUTE_META]: { method: 'GET', path: '/users/error' } }
    ),
  };
}

