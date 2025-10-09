import type { Container } from '@kurdel/ioc';
import type { AppModule, ProviderConfig } from '@kurdel/core/app';
import type { Middleware } from '@kurdel/core/http';
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
