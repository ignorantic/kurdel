import { IoCControllerResolver } from '../ioc-controller-resolver.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Router } from '../router.js';
import { CONTROLLER_CLASSES } from '../config.js';
/**
 * ControllerModule
 *
 * - Registers controllers from AppConfig
 * - Wires Router with IoCControllerResolver and MiddlewareRegistry
 * - Exports Router and CONTROLLER_CLASSES
 */
export class ControllerModule {
    constructor(config) {
        this.imports = { registry: MiddlewareRegistry };
        this.exports = {
            controllers: CONTROLLER_CLASSES,
            router: Router,
        };
        const { controllers = [] } = config;
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
                    controllers: CONTROLLER_CLASSES,
                    registry: MiddlewareRegistry,
                },
            },
            ...controllers.map(({ use, deps, middlewares }) => ({
                provide: use,
                useClass: use,
                deps,
            })),
            {
                provide: CONTROLLER_CLASSES,
                useInstance: controllers.map((c) => c.use),
            },
        ];
        this.register = async (ioc) => {
            const registry = ioc.get(MiddlewareRegistry);
            controllers.forEach(({ use, middlewares }) => {
                middlewares?.forEach((mw) => registry.useFor(use, mw));
            });
        };
    }
    async register(_ioc) {
        // No-op (everything in providers)
    }
}
//# sourceMappingURL=controller-module.js.map