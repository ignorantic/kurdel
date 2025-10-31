import type { HttpContext, Controller, Middleware, ActionResult } from '@kurdel/core/http';

import { RuntimeMiddlewarePipe } from 'src/http/runtime-middleware-pipe.js';

/**
 * Executes a controller action inside a composed middleware pipeline.
 */
export class RuntimeControllerPipe {
  constructor(private readonly globalMiddlewares: Middleware[] = []) {}

  async run<TReadable = unknown>(
    controller: Controller<any>,
    ctx: HttpContext<unknown, Record<string, string>, TReadable>,
    actionName: string
  ): Promise<ActionResult<TReadable> | void> {
    const handler = controller.getAction(actionName);

    if (typeof handler !== 'function') {
      return ctx.text(404, `Action '${actionName}' not found in '${controller.constructor.name}'.`);
    }

    const allMiddlewares = [...this.globalMiddlewares, ...controller.getMiddlewares()];
    const pipe = new RuntimeMiddlewarePipe(allMiddlewares);

    return pipe.run<TReadable>(ctx, async () => (await handler.call(controller, ctx))  as ActionResult<TReadable>);
  }
}
