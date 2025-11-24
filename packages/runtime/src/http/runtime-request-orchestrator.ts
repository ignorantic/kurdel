import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { Container } from '@kurdel/ioc';
import type {
  ResponseRenderer,
  Router,
  Method,
  RouteMatch,
  MiddlewareRegistry,
  Controller,
  MiddlewareZone,
} from '@kurdel/core/http';
import { HttpError } from '@kurdel/core/http';

import { ControllerActionMissingResultError } from 'src/app/errors/controller-action-missing-result-error.js';
import { RuntimeHttpContextFactory } from 'src/http/runtime-http-context-factory.js';
import { RuntimeControllerPipe } from 'src/http/runtime-controller-pipe.js';
import { RuntimeMiddlewarePipe } from 'src/http/runtime-middleware-pipe.js';

/**
 * ## RuntimeRequestOrchestrator
 *
 * Strict, deterministic pipeline:
 * resolve → validate → pre → controller → render → post → error → final
 *
 * Zones:
 * - `pre`    before controller (may short-circuit)
 * - `post`   after successful render only
 * - `error`  on exceptions
 * - `final`  always executed
 */
export class RuntimeRequestOrchestrator {
  private readonly contextFactory = new RuntimeHttpContextFactory();
  private readonly controllerPipe = new RuntimeControllerPipe();

  constructor(
    private readonly router: Router,
    private readonly renderer: ResponseRenderer,
    private readonly registry: MiddlewareRegistry
  ) {}

  async execute(req: HttpRequest, res: HttpResponse, scope: Container): Promise<void> {
    const method = (req.method as Method) ?? 'GET';
    const url = req.url ?? '/';

    // 1️⃣ Resolve route
    const routeMatch = this.router.resolve(method, url, scope);

    // 2️⃣ 404 fallback
    if (!routeMatch) {
      this.renderer.handleError(res, new HttpError(404, 'Not Found'));
      return;
    }

    // 3️⃣ Build HttpContext
    const ctx = this.contextFactory.create(req, res, routeMatch);

    // 4️⃣ Validation (before PRE)
    const schema = routeMatch.schema;

    try {
      if (schema?.body) {
        ctx.body = await schema.body.validate(ctx.body);
      }
      if (schema?.params) {
        ctx.params = await schema.params.validate(ctx.params);
      }
      if (schema?.query) {
        ctx.query = await schema.query.validate(ctx.query);
      }
    } catch (err) {
      this.renderer.handleError(res, err);
      await this.runFinal(ctx, routeMatch);
      return;
    }

    try {
      // 5️⃣ PRE middleware (may short-circuit)
      const preResult = await this.runZone('pre', ctx, routeMatch);
      if (preResult) {
        ctx.result = preResult;
        this.renderer.render(res, preResult);
        await this.runFinal(ctx, routeMatch);
        return;
      }

      // 6️⃣ Controller execution
      const result = await this.controllerPipe.run(routeMatch.controller, ctx, routeMatch.action);

      if (typeof result === 'undefined') {
        throw new ControllerActionMissingResultError(routeMatch.controller, routeMatch.action);
      }

      ctx.result = result;

      // 7️⃣ Render controller result
      this.renderer.render(res, result);

      // 8️⃣ POST only if render happened
      if (res.sent) {
        await this.runZone('post', ctx, routeMatch);
      }

    } catch (err) {
      // 9️⃣ ERROR middleware zone
      const errorResult = await this.runZone('error', ctx, routeMatch, err);

      if (errorResult && !res.sent) {
        this.renderer.render(res, errorResult);
      } else if (!res.sent) {
        this.renderer.handleError(res, err);
      }

    } finally {
      // 🔟 FINAL always executed
      await this.runFinal(ctx, routeMatch);
    }
  }

  /** Collects middlewares for a given zone. */
  private collect(zone: MiddlewareZone, match: RouteMatch) {
    const ctor = match.controller?.constructor as new () => Controller;

    return [
      ...this.registry.all(zone),
      ...(ctor ? this.registry.for(ctor, zone, match.action) : []),
    ].map(m => m.use);
  }

  /** Runs a middleware zone. */
  private async runZone(
    zone: MiddlewareZone,
    ctx: any,
    match: RouteMatch,
    error?: unknown
  ) {
    const fns = this.collect(zone, match);
    if (!fns.length) return;

    const pipe = new RuntimeMiddlewarePipe(fns);
    
    if (zone === 'error' && error !== undefined) {
      ctx.error = error;
    }

    return pipe.run(ctx);
  }

  /** Runs FINAL zone. */
  private async runFinal(ctx: any, match: RouteMatch) {
    return this.runZone('final', ctx, match);
  }
}
