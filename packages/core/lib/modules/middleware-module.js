import { MiddlewareRegistry } from '../middleware-registry.js';
import { errorHandler } from '../middlewares/error-handle.js';
/**
 * MiddlewareModule
 *
 * - Exports: MiddlewareRegistry
 * - Imports: none
 *
 * Registers global middleware pipeline:
 * - creates MiddlewareRegistry
 * - attaches user-provided middlewares
 * - always attaches built-in errorHandler as last middleware
 */
export const MiddlewareModule = {
    exports: { registry: MiddlewareRegistry },
    register(ioc, config) {
        const registry = new MiddlewareRegistry();
        ioc.bind(MiddlewareRegistry).toInstance(registry);
        (config.middlewares ?? []).forEach((mw) => registry.use(mw));
        registry.use(errorHandler);
    },
};
//# sourceMappingURL=middleware-module.js.map