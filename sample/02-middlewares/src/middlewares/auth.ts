import { HttpError, Middleware } from "@kurdel/core";

export const authMiddleware: Middleware = async (ctx, next) => {
  if (!ctx.req.headers['authorization']) {
    throw new HttpError(400, 'Unauthorized');
  }
  return next();
};
