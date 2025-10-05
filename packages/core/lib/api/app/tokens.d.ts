import { ServerAdapter, Router } from '../http/interfaces.js';
export declare const TOKENS: {
    ServerAdapter: import("@kurdel/ioc").InjectionToken<ServerAdapter<import("../http/interfaces.js").RequestLike, import("../http/interfaces.js").ResponseLike>>;
    Router: import("@kurdel/ioc").InjectionToken<Router>;
    ControllerClasses: import("@kurdel/ioc").InjectionToken<unknown>;
    ControllerConfigs: import("@kurdel/ioc").InjectionToken<unknown>;
    MiddlewareRegistry: import("@kurdel/ioc").InjectionToken<unknown>;
    ControllerResolver: import("@kurdel/ioc").InjectionToken<unknown>;
};
