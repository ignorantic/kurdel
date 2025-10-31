import type { HttpContext, Middleware, ActionResult } from '@kurdel/core/http';

/**
 * Composes and executes a middleware pipeline.
 * Used both before routing and around controller actions.
 */
export class RuntimeMiddlewarePipe {
  constructor(private readonly middlewares: Middleware[] = []) {}

  async run<TReadable = unknown>(
    ctx: HttpContext,
    terminal?: () => Promise<ActionResult<TReadable> | void>
  ): Promise<ActionResult<TReadable> | void> {
    const dispatch = async (): Promise<ActionResult<TReadable> | void> =>
      terminal ? await terminal() : undefined;

    const composed = this.middlewares.reduceRight<() => Promise<ActionResult<any> | void>>(
      (next, mw) => {
        return async () => {
          const result = await mw(ctx, next);
          return result ?? (await next());
        };
      },
      dispatch
    );

    return composed() as Promise<ActionResult<TReadable> | void>;;
  }
}
