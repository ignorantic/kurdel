import type { ActionResult } from '@kurdel/core/http';
import { route, Controller } from '@kurdel/core/http';

export class MixedController extends Controller {
  readonly routes = {
    public: route({ method: 'GET', path: '/public' })(this.public),
    secure: route({ method: 'GET', path: '/secure', auth: { strategy: 'jwt', roles: ['admin'] } })(this.secure),
  };

  async public(): Promise<ActionResult> {
    return { status: 200, kind: 'json', body: { ok: true } };
  }

  async secure(ctx: any): Promise<ActionResult> {
    return { status: 200, kind: 'json', body: { user: ctx.user } };
  }
}
