import type { ActionResult, HttpContext } from '@kurdel/core/http';
import { Controller, route } from '@kurdel/core/http';

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

