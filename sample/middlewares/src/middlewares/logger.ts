import type { Middleware } from '@kurdel/core/http';

export const loggerMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  const status = ctx.result?.status ?? 0;
  console.log(`${ctx.req.method} ${ctx.url.pathname} -> ${status} (${ms}ms)`);
};