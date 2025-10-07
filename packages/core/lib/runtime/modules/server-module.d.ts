import { Container } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from '../../api/app/app-module.js';
import { AppConfig } from '../../api/app/config.js';
import { RequestLike, ResponseLike, ServerAdapter } from '../../api/http/interfaces.js';
import { Router } from '../../api/http/router.js';
/**
* ServerModule: wires the HTTP ServerAdapter to the Router.
*
* - Provides a singleton ServerAdapter implementation
* - Injects the root Container and the Router into the adapter
* - No global state; request-scope is created inside the adapter per request-scope
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
