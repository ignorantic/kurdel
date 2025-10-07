import type { Middleware } from 'src/api/http/middleware.js';
import { BadRequest } from 'src/api/http/http-results.js';

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

  if (contentType.includes('application/json')) {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of ctx.req) {
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString();

      if (raw.length > 0) {
        ctx.body = JSON.parse(raw);
      }
    } catch {
      throw BadRequest('Invalid JSON');
    }
  }

  return next();
};
