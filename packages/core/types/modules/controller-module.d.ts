import { IoCContainer } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from './app-module.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Router } from '../router.js';
import { ControllerConfig } from '../http/interfaces.js';
export declare const CONTROLLER_CONFIGS: unique symbol;
/**
 * ControllerModule
 *
 * - Registers controllers from all HttpModules
 * - Wires Router with IoCControllerResolver and MiddlewareRegistry
 * - Supports controller-level middlewares and prefix metadata
 */
export declare class ControllerModule implements AppModule {
    private controllers;
    readonly imports: {
        registry: typeof MiddlewareRegistry;
    };
    readonly exports: {
        controllerConfigs: symbol;
        router: typeof Router;
    };
    readonly providers: ProviderConfig[];
    constructor(controllers: ControllerConfig[]);
    register(ioc: IoCContainer): Promise<void>;
}
//# sourceMappingURL=controller-module.d.ts.map