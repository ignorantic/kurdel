import type { Middleware} from '@kurdel/core/http';
import { Unauthorized } from '@kurdel/core/http';

export const authMiddleware: Middleware = async (ctx, next) => {
  if (!ctx.req.headers['authorization']) {
    throw Unauthorized();
  }
  return next();
};
