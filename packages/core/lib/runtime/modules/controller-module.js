import { IoCControllerResolver } from '../../runtime/ioc-controller-resolver.js';
import { MiddlewareRegistry } from '../../runtime/middleware-registry.js';
import { Router } from '../../runtime/router.js';
import { TOKENS } from '../../api/tokens.js';
/**
 * ControllerModule
 *
 * - Registers controllers from all HttpModules
 * - Wires Router with IoCControllerResolver and MiddlewareRegistry
 * - Supports controller-level middlewares and prefix metadata
 */
export class ControllerModule {
    constructor(controllers) {
        this.controllers = controllers;
        this.imports = { registry: MiddlewareRegistry };
        this.exports = {
            controllerConfigs: TOKENS.ControllerConfigs,
            router: Router,
        };
        this.providers = [
            {
                provide: IoCControllerResolver,
                useFactory: (ioc) => new IoCControllerResolver(ioc),
                isSingleton: true,
            },
            {
                provide: Router,
                useClass: Router,
                deps: {
                    resolver: IoCControllerResolver,
                    controllerConfigs: TOKENS.ControllerConfigs,
                    registry: MiddlewareRegistry,
                },
            },
            ...controllers.map((c) => ({
                provide: c.use,
                useClass: c.use,
                deps: c.deps,
            })),
            {
                provide: TOKENS.ControllerConfigs,
                useInstance: controllers,
            },
        ];
    }
    async register(ioc) {
        const registry = ioc.get(MiddlewareRegistry);
        this.controllers.forEach((c) => {
            c.middlewares?.forEach((mw) => registry.useFor(c.use, mw));
        });
    }
}
//# sourceMappingURL=controller-module.js.map