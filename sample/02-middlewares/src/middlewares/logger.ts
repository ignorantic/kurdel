import { Middleware } from "@kurdel/core";

export const loggerMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();
  const result = await next();
  const ms = Date.now() - start;
  console.log(`${ctx.req.method} ${ctx.url.pathname} -> ${result.status} (${ms}ms)`);
  return result;
};
