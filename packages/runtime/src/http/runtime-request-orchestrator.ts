import type { HttpRequest, HttpResponse } from '@kurdel/common';
import type { Middleware, Controller, ResponseRenderer } from '@kurdel/core/http';
import { HttpError } from '@kurdel/core/http';

import { RuntimeHttpContextFactory } from 'src/http/runtime-http-context-factory.js';
import { RuntimeControllerPipe } from 'src/http/runtime-controller-pipe.js';
import { RuntimeMiddlewarePipe } from 'src/http/runtime-middleware-pipe.js';

/**
 * Coordinates full request execution within the runtime layer.
 *
 * Responsibilities:
 * - Create a per-request HttpContext
 * - Execute middleware and controller pipelines
 * - Render the final ActionResult or handle errors
 */
export class RuntimeRequestOrchestrator {
  private readonly contextFactory = new RuntimeHttpContextFactory();

  constructor(
    private readonly renderer: ResponseRenderer,
    private readonly globalMiddlewares: Middleware[] = [],
  ) {}

  /**
   * Executes a request using either:
   * - a controller + action (for routed requests)
   * - global middleware chain + 404 (for unmatched paths)
   */
  async execute(
    req: HttpRequest,
    res: HttpResponse,
    controller?: Controller,
    actionName?: string
  ): Promise<void> {
    const ctx = this.contextFactory.create(req, res);

    if (controller && actionName) {
      const controllerPipe = new RuntimeControllerPipe(this.globalMiddlewares);

      try {
        const result = await controllerPipe.run(controller, ctx, actionName);
        this.renderer.render(res, result);
      } catch (err) {
        this.renderer.handleError(res, err);
      }

      return;
    }

    // No route matched → execute global middlewares + 404 fallback
    const prePipe = new RuntimeMiddlewarePipe(this.globalMiddlewares);
    const preResult = await prePipe.run(ctx);

    if (res.sent || preResult) {
      if (preResult) this.renderer.render(res, preResult);
      return;
    }

    if (!res.sent) {
      this.renderer.handleError(
        res,
        new HttpError(404, `404 Not Found: ${req.method} ${req.url}`)
      );
    }
  }
}
