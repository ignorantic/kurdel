import { Middleware } from "@kurdel/core";

export const authMiddleware: Middleware = async (ctx, next) => {
  if (!ctx.req.headers['authorization']) {
    return { kind: 'json', status: 401, body: { error: 'Unauthorized' } };
  }
  return next();
};
