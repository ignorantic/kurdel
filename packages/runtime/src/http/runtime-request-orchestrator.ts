import type { HttpRequest, HttpResponse, Newable } from '@kurdel/common';
import type { Container } from '@kurdel/ioc';
import type {
  ResponseRenderer,
  Router,
  Method,
  RouteMatch,
  MiddlewareRegistry,
  Controller,
  ActionResult,
  MiddlewareZone,
} from '@kurdel/core/http';

import { RuntimeHttpContextFactory } from 'src/http/runtime-http-context-factory.js';
import { RuntimeControllerPipe } from 'src/http/runtime-controller-pipe.js';
import { RuntimeMiddlewarePipe } from 'src/http/runtime-middleware-pipe.js';

/**
 * ## RuntimeRequestOrchestrator (v3.1)
 *
 * Executes the full request lifecycle using zoned middleware pipelines.
 *
 * Zones:
 * - `pre`:    runs before controller
 * - `post`:   runs after successful render
 * - `error`:  runs on exceptions
 * - `final`:  always runs, even after errors or early exits
 */
export class RuntimeRequestOrchestrator {
  private readonly contextFactory = new RuntimeHttpContextFactory();

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
      return this.render404(req, res);
    }

    // 3️⃣ Build context
    const ctx = this.contextFactory.create(req, res, routeMatch);

    try {
      // 4️⃣ PRE middlewares
      const prePipe = new RuntimeMiddlewarePipe(this.collect('pre', routeMatch));
      const preResult = await prePipe.run(ctx);
      if (preResult) {
        ctx.result = preResult;
        this.renderer.render(res, preResult);
        return;
      }

      // 5️⃣ Controller execution
      let result: ActionResult<unknown> | void;
      if (routeMatch.controller && routeMatch.action) {
        const controllerPipe = new RuntimeControllerPipe();
        result = await controllerPipe.run(routeMatch.controller, ctx, routeMatch.action);
        if (result) {
          ctx.result = result;
          this.renderer.render(res, result);
        }
      }

      // 6️⃣ POST middlewares (executed after controller render)
      const postPipe = new RuntimeMiddlewarePipe(this.collect('post', routeMatch));
      const postResult = await postPipe.run(ctx);
      if (postResult && !res.sent) {
        ctx.result = postResult;
        this.renderer.render(res, postResult);
      }
    } catch (err) {
      // 7️⃣ ERROR middlewares
      const errorPipe = new RuntimeMiddlewarePipe(this.collect('error', routeMatch));
      try {
        const errorResult = await errorPipe.run(ctx);
        if (errorResult && !res.sent) {
          ctx.result = errorResult;
          this.renderer.render(res, errorResult);
          return;
        }
      } catch {
        /* nested error ignored */
      }

      // 8️⃣ Fallback render for unhandled error
      if (!res.sent) {
        this.renderer.handleError(res, err);
      }
    } finally {
      // 9️⃣ FINAL middlewares (always executed)
      const finalPipe = new RuntimeMiddlewarePipe(this.collect('final', routeMatch));
      await finalPipe.run(ctx);
    }
  }

  /** Collects middlewares for the given zone and route (global + controller). */
  private collect(zone: MiddlewareZone, route: RouteMatch) {
    const controller = route.controller?.constructor as unknown as Newable<Controller>;
    return [
      ...this.registry.all(zone),
      ...(controller ? this.registry.for(controller, zone, route.action) : []),
    ].map(r => r.use);
  }

  /** Renders a plain 404 response (used when no route matches). */
  private render404(_req: HttpRequest, res: HttpResponse) {
    if ('status' in res && typeof (res as any).status === 'function') {
      (res as any).status(404).send('Not Found');
    } else {
      (res as any).statusCode = 404;
      (res as any).end?.('Not Found');
    }
  }
}
