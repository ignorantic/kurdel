import type { ActionResult } from '@kurdel/core/http';
import { route, Controller } from '@kurdel/core/http';

export class SecureController extends Controller {
  readonly routes = {
    login: route({ method: 'GET', path: '/login', auth: { public: true } })(this.login),
    system: route({ method: 'GET', path: '/system' })(this.system),
  };

  async login(_ctx: any): Promise<ActionResult> {
    return { status: 200, kind: 'json', body: { ok: true } };
  }

  async system(ctx: any): Promise<ActionResult> {
    return { status: 200, kind: 'json', body: { user: ctx.user } };
  }
}
