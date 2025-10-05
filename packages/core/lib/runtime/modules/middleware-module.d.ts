import { Container } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from '../../api/app/app-module.js';
import { Middleware } from '../../api/http/types.js';
/**
 * MiddlewareModule
 *
 * - Provides a singleton MiddlewareRegistry
 * - Registers default global middlewares and app-provided ones
 */
export declare class MiddlewareModule implements AppModule {
    private middlewares;
    readonly exports: {
        registry: import("@kurdel/ioc").InjectionToken<unknown>;
    };
    readonly providers: ProviderConfig[];
    constructor(middlewares: Middleware[]);
    register(ioc: Container): Promise<void>;
}
