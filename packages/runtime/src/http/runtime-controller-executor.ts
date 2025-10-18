import type { HttpRequest, HttpResponse } from '@kurdel/common';

import type {
  Controller,
  Middleware,
  HttpContext,
  ActionResult,
  JsonValue,
} from '@kurdel/core/http';

import { HttpError } from '@kurdel/core/http';
import { renderActionResult } from 'src/http/render-action-result.js';

/**
 * Executes controller actions with middleware composition.
 *
 * Responsibilities:
 * - Build a per-request HttpContext
 * - Compose and execute middlewares + controller action
 * - Render the resulting ActionResult into an HttpResponse
 * - Handle HttpError and unexpected exceptions gracefully
 */
export class RuntimeControllerExecutor<TDeps = unknown> {
  constructor(private readonly globalMiddlewares: Middleware[] = []) {}

  /**
   * Executes a controller action within a composed middleware pipeline.
   *
   * @param controller - Controller instance to invoke
   * @param req - Incoming request (platform-agnostic)
   * @param res - Outgoing response (platform-agnostic)
   * @param actionName - The name of the action method to execute
   */
  async execute(
    controller: Controller<TDeps>,
    req: HttpRequest,
    res: HttpResponse,
    actionName: string
  ): Promise<void> {
    const handler = controller.getAction(actionName);

    // Controller method not found → 404
    if (typeof handler !== 'function') {
      res
        .status(404)
        .send(`The method '${actionName}' was not found in '${controller.constructor.name}'.`);
      return;
    }

    // Build request-scoped execution context
    const ctx: HttpContext = {
      req,
      res,
      url: new URL(req.url, 'http://internal'),
      query: req.query,
      params: (req as any).__params ?? {},
      body: req.body,

      json(status, body) {
        return { kind: 'json', status, body };
      },
      text(status, body) {
        return { kind: 'text', status, body };
      },
      redirect(status, location) {
        return { kind: 'redirect', status, location };
      },
      noContent() {
        return { kind: 'empty', status: 204 };
      },
    };

    // Combine global + controller-level middlewares
    const pipeline = [...this.globalMiddlewares, ...controller.getMiddlewares()];

    // Final action invocation
    const dispatch = async (): Promise<ActionResult> => handler.call(controller, ctx);

    // Compose middleware chain (right-to-left)
    const composed = pipeline.reduceRight<() => Promise<ActionResult>>((next, mw) => {
      return async () => {
        const result = await mw(ctx, next);
        // If middleware returns a result → short-circuit the chain
        if (result) return result;
        // Otherwise, continue to next
        return await next();
      };
    }, dispatch);

    try {
      const result = await composed();

      // Only render once if response not already sent
      if (!res.sent) {
        renderActionResult(res, result);
      }
    } catch (err) {
      // Unified error handling
      if (!res.sent) {
        if (err instanceof HttpError) {
          renderActionResult(res, {
            kind: 'json',
            status: err.status,
            body: {
              error: err.message,
              details: err.details as JsonValue,
            },
          });
        } else {
          renderActionResult(res, {
            kind: 'json',
            status: 500,
            body: { error: 'Internal Server Error' },
          });
        }
      }
    }
  }
}
