import type { HttpContext, Controller, Middleware, ActionResult } from '@kurdel/core/http';
import { RuntimeMiddlewarePipe } from 'src/http/runtime-middleware-pipe.js';

/**
 * RuntimeControllerPipe
 *
 * Executes a controller action within a pre-assembled middleware chain.
 *
 * Notes:
 * - The list of middlewares is prepared upstream (e.g. by RuntimeRequestOrchestrator)
 * - ControllerPipe does not merge middlewares itself
 * - If the action is missing, produces a 404 text result
 */
export class RuntimeControllerPipe<TReadable = unknown> {
  constructor(
    private readonly middlewares: readonly Middleware<HttpContext<any, any, TReadable>>[] = []
  ) {}

  async run(
    controller: Controller<any>,
    ctx: HttpContext<unknown, Record<string, string>, TReadable>,
    actionName: string
  ): Promise<ActionResult<TReadable> | void> {
    const handler = controller.getAction(actionName);

    if (typeof handler !== 'function') {
      return ctx.text(404, `Action '${actionName}' not found in '${controller.constructor.name}'.`);
    }

    const pipe = new RuntimeMiddlewarePipe(this.middlewares as Middleware[]);

    const result = await pipe.run(
      ctx,
      async () => (await handler.call(controller, ctx)) as ActionResult<TReadable>
    );

    return result as ActionResult<TReadable> | void;
  }
}
