import type { HttpContext, Middleware, ActionResult } from '@kurdel/core/http';

/**
 * ## RuntimeMiddlewarePipe
 *
 * Executes middleware chain in declared order.
 *
 * - Stops on returned ActionResult
 * - Stops on thrown error
 * - Calls `next()` only when middleware yields `undefined`
 */
export class RuntimeMiddlewarePipe {
  constructor(private readonly middlewares: Middleware[] = []) {}

  async run(
    ctx: HttpContext,
    terminal?: () => Promise<ActionResult | void>
  ): Promise<ActionResult | void> {
    const dispatch = async (index: number): Promise<ActionResult | void> => {
      if (index >= this.middlewares.length) {
        return terminal ? await terminal() : undefined;
      }

      const mw = this.middlewares[index];
      const result = await mw(ctx, () => dispatch(index + 1));

      // 🚫 STOP: middleware returned an ActionResult
      if (result !== undefined) {
        return result;
      }

      // otherwise continue automatically (middleware already called next)
      return undefined;
    };

    return dispatch(0);
  }
}
