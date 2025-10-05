import { Container } from '@kurdel/ioc';
import { ControllerConfig } from '../../api/http/interfaces.js';
import { AppModule, ProviderConfig } from '../../api/app/app-module.js';
/**
 * ControllerModule
 *
 * - Registers controllers from all HttpModules
 * - Wires Router with IoCControllerResolver and MiddlewareRegistry
 * - Supports controller-level middlewares and prefix metadata
 */
export declare class ControllerModule implements AppModule {
    private controllers;
    readonly exports: {
        controllerConfigs: import("@kurdel/ioc").InjectionToken<unknown>;
    };
    readonly providers: ProviderConfig[];
    constructor(controllers: ControllerConfig[]);
    register(ioc: Container): Promise<void>;
}
