import { TOKENS } from '@kurdel/core/app';
import { RuntimeControllerResolver } from '../http/runtime-controller-resolver.js';
import { RuntimeRouter } from '../http/runtime-router.js';
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
                useFactory: (ioc) => new RuntimeControllerResolver(ioc),
                isSingleton: true,
            },
            {
                provide: TOKENS.Router,
                useClass: RuntimeRouter,
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