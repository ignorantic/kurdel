import type { ActionResult } from 'src/api/http/types.js';
import type { HttpContext } from 'src/api/http/http-context.js';
import { Controller } from 'src/api/http/controller.js';
import { route } from 'src/api/http/route.js';

type Deps = { tag: string; calls: string[] };

export class FakeController extends Controller<Deps> {
  constructor(deps: Deps) {
    super(deps);
  }

  readonly routes = {
    ping: route({ method: 'GET', path: '/ping/:id' })(this.ping),
  };

  async ping(ctx: HttpContext<Deps>): Promise<ActionResult> {
    this.deps.calls.push(`ping:${ctx.params.id}:${this.deps.tag}`);
    return { kind: 'json', status: 200, body: { ok: true, id: ctx.params.id, tag: this.deps.tag } };
  }
}

