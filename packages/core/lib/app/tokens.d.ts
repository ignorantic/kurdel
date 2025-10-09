import { ServerAdapter } from '../http/interfaces.js';
import { Router } from '../http/router.js';
export declare const TOKENS: {
    ServerAdapter: import("@kurdel/ioc").InjectionToken<ServerAdapter<import("../http/interfaces.js").RequestLike, import("../http/interfaces.js").ResponseLike>>;
    Router: import("@kurdel/ioc").InjectionToken<Router>;
    ControllerClasses: import("@kurdel/ioc").InjectionToken<unknown>;
    ControllerConfigs: import("@kurdel/ioc").InjectionToken<unknown>;
    MiddlewareRegistry: import("@kurdel/ioc").InjectionToken<unknown>;
    ControllerResolver: import("@kurdel/ioc").InjectionToken<unknown>;
    OnStart: import("@kurdel/ioc").InjectionToken<import("./lifecycle.js").LifecycleHook[]>;
    OnShutdown: import("@kurdel/ioc").InjectionToken<import("./lifecycle.js").LifecycleHook[]>;
};
