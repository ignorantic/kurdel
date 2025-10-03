import { IoCContainer } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from '../../api/app-module.js';
import { MiddlewareRegistry } from '../../runtime/middleware-registry.js';
import { Router } from '../../runtime/router.js';
import { ControllerConfig } from '../../api/interfaces.js';
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
        controllerConfigs: import("@kurdel/ioc").InjectionToken<unknown>;
        router: typeof Router;
    };
    readonly providers: ProviderConfig[];
    constructor(controllers: ControllerConfig[]);
    register(ioc: IoCContainer): Promise<void>;
}
