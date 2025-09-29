import { BadRequest } from '../../../api/http-results.js';
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
export const jsonBodyParser = async (ctx, next) => {
    const contentType = ctx.req.headers['content-type'] ?? '';
    if (contentType.includes('application/json')) {
        try {
            const chunks = [];
            for await (const chunk of ctx.req) {
                chunks.push(chunk);
            }
            const raw = Buffer.concat(chunks).toString();
            if (raw.length > 0) {
                ctx.body = JSON.parse(raw);
            }
        }
        catch {
            throw BadRequest('Invalid JSON');
        }
    }
    return next();
};
//# sourceMappingURL=json-body-parser.js.map