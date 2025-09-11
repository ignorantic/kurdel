import { MiddlewareRegistry } from '../middleware-registry.js';
import { errorHandler } from '../middlewares/error-handle.js';
export class MiddlewareInitializer {
    run(ioc, config) {
        const registry = new MiddlewareRegistry();
        ioc.bind(MiddlewareRegistry).toInstance(registry);
        (config.middlewares ?? []).forEach((mw) => registry.use(mw));
        registry.use(errorHandler);
    }
}
//# sourceMappingURL=middleware-initializer.js.map