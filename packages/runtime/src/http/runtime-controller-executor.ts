import type { IncomingMessage, ServerResponse } from 'node:http';

import type {
  Controller,
  Middleware,
  HttpContext,
  ActionResult,
  JsonValue,
} from '@kurdel/core/http';

import { HttpError } from '@kurdel/core/http';

import { renderActionResult } from 'src/http/response/render-action-result.js';
import { adaptNodeRequest, adaptNodeResponse } from 'src/http/adapters/node-http-adapter.js';

export class RuntimeControllerExecutor<TDeps = unknown> {
  constructor(private readonly globalMiddlewares: Middleware[] = []) {}

  async execute(
    controller: Controller<TDeps>,
    req: IncomingMessage,
    res: ServerResponse,
    actionName: string
  ): Promise<void> {
    const handler = controller.getAction(actionName);
    if (typeof handler !== 'function') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(
        `The method '${actionName}' was not found in '${controller.constructor.name}' class.`
      );
      return;
    }
    const request = await adaptNodeRequest(req);
    const response = adaptNodeResponse(res);

    const ctx: HttpContext = {
      req: request,
      res: response,
      url: new URL(request.url, 'http://internal'),
      query: request.query,
      params: (req as any).__params ?? {},
      body: request.body,
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

    const pipeline = [...this.globalMiddlewares, ...controller.getMiddlewares()];

    const dispatch = async (): Promise<ActionResult> => handler.call(controller, ctx);

    const composed = pipeline.reduceRight<() => Promise<ActionResult>>((next, mw) => {
      return async () => {
        // middleware всегда вызывается с ctx и next
        const result = await mw(ctx, next);

        // если middleware вернул результат — прерываем цепочку
        if (result) return result;

        // иначе продолжаем дальше
        return await next();
      };
    }, dispatch);

    try {
      const result = await composed();
      if (!res.headersSent) renderActionResult(res, result);
    } catch (err) {
      if (!res.headersSent) {
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
