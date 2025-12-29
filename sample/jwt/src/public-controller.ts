import type { ActionResult } from '@kurdel/core/http';
import { route, Controller } from '@kurdel/core/http';

export class PublicController extends Controller {
  readonly routes = {
    home: route({ method: 'GET', path: '/home' })(this.home),
  };

  async home(): Promise<ActionResult> {
    return { status: 200, kind: 'json', body: { ok: true } };
  }
}
