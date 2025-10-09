import { TOKENS } from '@kurdel/core/app';
import { ControllerResolverImpl } from '../http/controller-resolver-impl.js';
import { RouterImpl } from '../http/router-impl.js';
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
        this.exports = {
            controllerConfigs: TOKENS.ControllerConfigs,
        };
        this.providers = [
            {
                provide: TOKENS.ControllerResolver,
                useFactory: (ioc) => new ControllerResolverImpl(ioc),
                isSingleton: true,
            },
            {
                provide: TOKENS.Router,
                useClass: RouterImpl,
                isSingleton: true,
                deps: {
                    resolver: TOKENS.ControllerResolver,
                    controllerConfigs: TOKENS.ControllerConfigs,
                    registry: TOKENS.MiddlewareRegistry,
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
        const registry = ioc.get(TOKENS.MiddlewareRegistry);
        this.controllers.forEach((c) => {
            c.middlewares?.forEach((mw) => registry.useFor(c.use, mw));
        });
    }
}
//# sourceMappingURL=controller-module.js.map