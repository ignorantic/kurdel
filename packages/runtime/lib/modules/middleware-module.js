import { TOKENS } from '@kurdel/core/app';
import { RuntimeMiddlewareRegistry } from '../http/runtime-middleware-registry.js';
import { errorHandler } from '../http/middlewares/error-handle.js';
import { jsonBodyParser } from '../http/middlewares/json-body-parser.js';
/**
 * MiddlewareModule
 *
 * - Provides a singleton MiddlewareRegistry
 * - Registers default global middlewares and app-provided ones
 */
export class MiddlewareModule {
    constructor(middlewares) {
        this.middlewares = middlewares;
        this.exports = { registry: TOKENS.MiddlewareRegistry };
        this.providers = [
            {
                provide: TOKENS.MiddlewareRegistry,
                useClass: RuntimeMiddlewareRegistry,
                isSingleton: true,
            },
        ];
    }
    async register(ioc) {
        const registry = ioc.get(TOKENS.MiddlewareRegistry);
        // Recommended order:
        // 1) parsers (json) → 2) user middlewares → 3) error handler (last)
        registry.use(errorHandler);
        this.middlewares.forEach(mw => registry.use(mw));
        registry.use(jsonBodyParser);
    }
}
//# sourceMappingURL=middleware-module.js.map