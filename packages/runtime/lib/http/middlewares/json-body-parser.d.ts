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
export declare const jsonBodyParser: Middleware;
