import type { HttpContext, Middleware, ActionResult } from '@kurdel/core/http';

/**
 * Composes and executes a middleware pipeline.
 * Used both before routing and around controller actions.
 */
export class RuntimeMiddlewarePipe {
  constructor(private readonly middlewares: Middleware[] = []) {}

  async run(
    ctx: HttpContext,
    terminal?: () => Promise<ActionResult | void>
  ): Promise<ActionResult | void> {
    const dispatch = async (): Promise<ActionResult | void> =>
      terminal ? await terminal() : undefined;

    const composed = this.middlewares.reduceRight<() => Promise<ActionResult | void>>(
      (next, mw) => {
        return async () => {
          const result = await mw(ctx, next);
          return result ?? (await next());
        };
      },
      dispatch
    );

    return composed();
  }
}
