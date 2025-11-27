import type { ActionResult, HttpContext } from '@kurdel/core/http';
import { route, Controller } from '@kurdel/core/http';

export class TestController extends Controller {
  readonly routes = {
    ok: route({ path: '/ok', method: 'GET' })(this.ok),
    throws: route({ path: '/throws', method: 'GET' })(this.throws),
    undefined: route({ path: '/undefined', method: 'GET' })(this.undefinedReturn),
  };

  async ok(_ctx: HttpContext): Promise<ActionResult> {
    return { kind: 'text', status: 200, body: 'OK' }; 
  }

  async throws(_ctx: HttpContext) {
    throw new Error('boom');
  }

  async undefinedReturn(_ctx: HttpContext): Promise<void> {
    return undefined;
  }
}
