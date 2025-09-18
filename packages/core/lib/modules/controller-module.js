import { IoCControllerResolver } from '../ioc-controller-resolver.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Router } from '../router.js';
export const CONTROLLER_CONFIGS = Symbol('CONTROLLER_CONFIGS');
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
            controllerConfigs: CONTROLLER_CONFIGS,
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
                    controllerConfigs: CONTROLLER_CONFIGS,
                    registry: MiddlewareRegistry,
                },
            },
            ...controllers.map((c) => ({
                provide: c.use,
                useClass: c.use,
                deps: c.deps,
            })),
            {
                provide: CONTROLLER_CONFIGS,
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