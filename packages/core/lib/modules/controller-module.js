import { CONTROLLER_CLASSES } from '../config.js';
import { IoCControllerResolver } from '../ioc-controller-resolver.js';
import { Router } from '../router.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
/**
 * ControllerModule
 *
 * - Exports: Router
 * - Imports: MiddlewareRegistry
 *
 * Registers controllers and their dependencies.
 * Attaches controller-specific middlewares.
 * Produces a Router instance with full route metadata.
 */
export const ControllerModule = {
    imports: { registry: MiddlewareRegistry },
    exports: { router: Router },
    register(ioc, config) {
        const { controllers = [] } = config;
        const registry = ioc.get(MiddlewareRegistry);
        controllers.forEach(({ use, deps, middlewares }) => {
            deps ? ioc.put(use).with(deps) : ioc.put(use);
            middlewares?.forEach((mw) => registry.useFor(use, mw));
        });
        ioc.bind(CONTROLLER_CLASSES).toInstance(controllers.map((c) => c.use));
        ioc.bind(IoCControllerResolver).toInstance(new IoCControllerResolver(ioc));
        ioc.put(Router).with({
            resolver: IoCControllerResolver,
            controllers: CONTROLLER_CLASSES,
            registry: MiddlewareRegistry,
        });
    },
};
//# sourceMappingURL=controller-module.js.map