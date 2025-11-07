import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { Container } from '@kurdel/ioc';
import type {
  Middleware,
  ResponseRenderer,
  Router,
  Method,
  RouteMatch,
  HttpContext,
} from '@kurdel/core/http';
import { HttpError } from '@kurdel/core/http';

import { RuntimeHttpContextFactory } from 'src/http/runtime-http-context-factory.js';
import { RuntimeControllerPipe } from 'src/http/runtime-controller-pipe.js';
import { RuntimeMiddlewarePipe } from 'src/http/runtime-middleware-pipe.js';

/**
 * ## RuntimeRequestOrchestrator
 *
 * Central coordinator of **per-request execution** within the Kurdel runtime.
 *
 * ### Responsibilities
 * - Build an isolated `HttpContext` (request, response, route metadata)
 * - Execute the appropriate **middleware pipeline** and **controller action**
 * - Handle **error rendering** and **404 fallbacks**
 *
 * ### Design Philosophy
 * - No platform-specific logic — adapters (Node, Express, etc.) just call `execute()`
 * - Stateless — a new `RuntimeRequestOrchestrator` instance is safe to share across requests
 * - Extensible — new middleware strategies or context factories can be injected later
 *
 * @example
 * ```ts
 * const orchestrator = new RuntimeRequestOrchestrator(router, renderer, middlewares);
 * serverAdapter.on((req, res) => orchestrator.execute(req, res, scope));
 * ```
 */
export class RuntimeRequestOrchestrator {
  /** Factory that builds per-request HttpContext objects */
  private readonly contextFactory = new RuntimeHttpContextFactory();

  /**
   * @param router - The active router instance used to resolve routes.
   * @param renderer - Renderer responsible for translating ActionResult → HttpResponse.
   * @param globalMiddlewares - Middlewares that run for all requests (CORS, logging, etc.).
   */
  constructor(
    private readonly router: Router,
    private readonly renderer: ResponseRenderer,
    private readonly globalMiddlewares: Middleware[] = [],
  ) {}

  /**
   * Executes the **entire request lifecycle**:
   * 1. Resolves the matching route (if any)
   * 2. Builds an `HttpContext`
   * 3. Executes global + controller-level middlewares
   * 4. Renders or handles errors
   *
   * @param req - The incoming request (adapter-level abstraction)
   * @param res - The outgoing response (adapter-level abstraction)
   * @param scope - The per-request IoC container
   *
   * @remarks
   * This method never throws — all errors are caught and sent to the renderer.
   */
  async execute(
    req: HttpRequest,
    res: HttpResponse,
    scope: Container,
  ): Promise<void> {
    const method = (req.method as Method) ?? 'GET';
    const url = req.url ?? '/';

    // 1️⃣ Route resolution
    const routeMatch = this.router.resolve(method, url, scope);

    // 2️⃣ Fallback for unmatched routes
    if (!routeMatch) {
      // set 404 regardless of type system
      if ('status' in res && typeof (res as any).status === 'function') {
        (res as any).status(404).send('Not Found');
      } else {
        (res as any).statusCode = 404;
        (res as any).end?.('Not Found');
      }
      return;
    }

    // 3️⃣ Build the HttpContext (includes req, res, route metadata)
    const ctx = this.contextFactory.create(req, res, routeMatch);

    // 4️⃣ Controller pipeline execution
    if (routeMatch.controller && routeMatch.action) {
      const controllerPipe = new RuntimeControllerPipe(this.mergeMiddlewares(routeMatch));

      try {
        const result = await controllerPipe.run(routeMatch.controller, ctx, routeMatch.action);
        this.renderer.render(res, result);
      } catch (err) {
        this.renderer.handleError(res, err);
      }

      return;
    }

    // 5️⃣ Global-only middleware pipeline (no route)
    const prePipe = new RuntimeMiddlewarePipe(this.globalMiddlewares);
    const preResult = await prePipe.run(ctx);

    if (res.sent || preResult) {
      if (preResult) this.renderer.render(res, preResult);
      return;
    }

    // 6️⃣ Explicit 404 fallback
    if (!res.sent) {
      this.renderer.handleError(
        res,
        new HttpError(404, `404 Not Found: ${req.method} ${req.url}`)
      );
    }
  }

  private mergeMiddlewares(routeMatch: RouteMatch): Middleware<HttpContext>[] {
    return [
      ...this.globalMiddlewares,
      ...(routeMatch.middlewares ?? []),
    ];
  }
}
