import type { Middleware } from '../../../src/types.ts';

export const LoggerMiddleware: Middleware = async (ctx, next) => {
  ctx.res.setHeader('x-logged', 'true');
  return next();
};

