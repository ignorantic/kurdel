import { CONTROLLER_CLASSES } from '../config.js';
import { IoCControllerResolver } from '../ioc-controller-resolver.js';
import { Router } from '../router.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
export class ControllerInitializer {
    run(ioc, config) {
        const { controllers } = config;
        if (!controllers)
            return;
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
    }
}
//# sourceMappingURL=controller-initializer.js.map