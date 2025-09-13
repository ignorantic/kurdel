import { MiddlewareRegistry } from '../middleware-registry.js';
import { errorHandler } from '../middlewares/error-handle.js';
/**
 * MiddlewareModule
 *
 * - Registers global middlewares
 * - Provides MiddlewareRegistry as an export
 */
export class MiddlewareModule {
    constructor() {
        this.exports = { registry: MiddlewareRegistry };
    }
    async register(ioc, config) {
        const registry = new MiddlewareRegistry();
        ioc.bind(MiddlewareRegistry).toInstance(registry);
        const { middlewares = [] } = config;
        middlewares.forEach((mw) => registry.use(mw));
        // Always include default error handler
        registry.use(errorHandler);
    }
}
//# sourceMappingURL=middleware-module.js.map