import type { Middleware } from '@kurdel/core/http';

export const loggerMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();
  const result = await next();
  const ms = Date.now() - start;

  if (result) {
    console.log(`${ctx.req.method} ${ctx.url.pathname} -> ${result.status} (${ms}ms)`);
  } else {
    // no ActionResult — probably already handled
    console.log(`${ctx.req.method} ${ctx.url.pathname} -> (handled upstream) (${ms}ms)`);
  }

  return result;
};
