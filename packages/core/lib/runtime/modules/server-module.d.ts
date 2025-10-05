import { Container } from '@kurdel/ioc';
import { RequestLike, ResponseLike, ServerAdapter, Router } from '../../api/http/interfaces.js';
import { AppModule, ProviderConfig } from '../../api/app/app-module.js';
import { AppConfig } from '../../api/app/config.js';
/**
 * ServerModule
 *
 * - Provides HTTP ServerAdapter implementation
 * - Wires adapter with Router via adapter.on(handler)
 * - Initializes Router with controller configs and middlewares
 */
export declare class ServerModule implements AppModule<AppConfig> {
    readonly imports: {
        router: import("@kurdel/ioc").InjectionToken<Router>;
        registry: import("@kurdel/ioc").InjectionToken<unknown>;
        controllerConfigs: import("@kurdel/ioc").InjectionToken<unknown>;
        controllerResolver: import("@kurdel/ioc").InjectionToken<unknown>;
    };
    readonly exports: {
        server: import("@kurdel/ioc").InjectionToken<ServerAdapter<RequestLike, ResponseLike>>;
    };
    readonly providers: ProviderConfig[];
    constructor(config: AppConfig);
    register(ioc: Container): Promise<void>;
}
