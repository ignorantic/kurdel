import type { ActionResult } from 'src/http/types.js';
import type { HttpContext } from 'src/http/http-context.js';
import type { Middleware } from 'src/http/middleware.js';
import type { RouteConfig } from 'src/http/route.js';

export abstract class Controller<TDeps = unknown> {
  constructor(protected readonly deps: TDeps) {}

  // strict whitelist
  abstract readonly routes: RouteConfig;

  private middlewares: Middleware[] = [];

  use(mw: Middleware) {
    this.middlewares.push(mw);
  }

  /** Exposed for runtime to build the pipeline. */
  getMiddlewares(): Middleware[] {
    return this.middlewares;
  }

  /** Exposed for runtime to resolve an action. */
  getAction(actionName: string) {
    return this.routes[actionName];
  }

  /** Optional explicit action resolver (runtime uses `routes` by default). */
  protected resolveAction(actionName: string) {
    return this.routes[actionName];
  }

  /**
   * Optionally overridden in tests or custom adapters,
   * but normally invoked through RuntimeControllerExecutor.
   */
  async handle(actionName: string, ctx: HttpContext): Promise<ActionResult> {
    const fn = this.resolveAction(actionName);
    if (typeof fn !== 'function') {
      throw new Error(`Action '${actionName}' not found in ${this.constructor.name}`);
    }
    return await fn.call(this, ctx);
  }
}
