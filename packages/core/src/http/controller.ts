import type { ActionResult, HtmlResult } from 'src/http/action-result.js';
import type { HttpContext } from 'src/http/http-context.js';
import type { Middleware } from 'src/http/middleware.js';
import type { RouteConfig } from 'src/http/route.js';
import type { TemplateEngine } from 'src/template/template-engine.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export abstract class Controller<TDeps extends Record<string, any> = {}> {
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
   * Render HTML via TemplateEngine injected into controller dependencies.
   * Throws if no TemplateEngine is available.
   */
  protected async render(
    template: string,
    data?: Record<string, unknown>,
    status = 200,
  ): Promise<HtmlResult> {
    const view = (this.deps as any).view as TemplateEngine | undefined;
    if (!view) {
      throw new Error(
        `TemplateEngine is not registered in controller dependencies (controller: ${this.constructor.name})`
      );
    }

    const html = await view.render(template, data ?? {});
    return {
      status,
      kind: 'html',
      body: html,
      contentType: 'text/html',
    };
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
