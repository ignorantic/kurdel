import { Middleware, Unauthorized } from "@kurdel/core";

export const authMiddleware: Middleware = async (ctx, next) => {
  if (!ctx.req.headers['authorization']) {
    throw Unauthorized();
  }
  return next();
};
