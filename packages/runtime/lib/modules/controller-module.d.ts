import type { Container } from '@kurdel/ioc';
import type { ControllerConfig } from '@kurdel/core/http';
import type { AppModule, ProviderConfig } from '@kurdel/core/app';
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
