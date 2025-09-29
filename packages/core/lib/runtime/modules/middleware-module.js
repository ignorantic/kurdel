import { MiddlewareRegistry } from 'src/runtime/middleware-registry.js';
import { errorHandler } from 'src/runtime/http/middlewares/error-handle.js';
import { jsonBodyParser } from 'src/runtime/http/middlewares/json-body-parser.js';
/**
 * MiddlewareModule
 *
 * - Registers global middlewares from all HttpModules
 */
export class MiddlewareModule {
    constructor(middlewares) {
        this.middlewares = middlewares;
        this.exports = { registry: MiddlewareRegistry };
        this.providers = [
            { provide: MiddlewareRegistry, useClass: MiddlewareRegistry, isSingleton: true },
        ];
    }
    async register(ioc) {
        const registry = ioc.get(MiddlewareRegistry);
        this.middlewares.forEach((mw) => registry.use(mw));
        // Always include default error handler and body parser
        registry.use(errorHandler);
        registry.use(jsonBodyParser);
    }
}
//# sourceMappingURL=middleware-module.js.map