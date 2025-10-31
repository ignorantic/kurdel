import type { Middleware } from '@kurdel/core/http';

/**
 * Parses JSON request body and assigns it to ctx.body.
 *
 * Usage:
 *   appConfig.middlewares = [jsonBodyParser];
 *
 * Then in controller:
 *   async create(ctx: HttpContext<Deps, { name: string }>) {
 *     if (!ctx.body?.name) throw BadRequest('Name is required');
 *     ...
 *   }
 */
export const jsonBodyParser: Middleware = async (ctx, next) => {
  const contentType = ctx.req.headers['content-type'] ?? '';
  if (!contentType.includes('application/json')) {
    return next();
  }

  if (ctx.req.body && typeof ctx.req.body === 'object') {
    ctx.body = ctx.req.body;
  }

  return next();
};
