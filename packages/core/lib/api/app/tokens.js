import { createGlobalToken } from '@kurdel/ioc';
export const TOKENS = {
    ServerAdapter: createGlobalToken('@kurdel/core/app:server-adapter'),
    Router: createGlobalToken('@kurdel/core/app:router'),
    ControllerClasses: createGlobalToken('@kurdel/core/app:controller-classes'),
    ControllerConfigs: createGlobalToken('@kurdel/core/app:controller-configs'),
    MiddlewareRegistry: createGlobalToken('@kurdel/core/app:middleware-registry'),
    ControllerResolver: createGlobalToken('@kurdel/core/app:controller-resolver'),
    OnStart: createGlobalToken('@kurdel/core/app:on-start'),
    OnShutdown: createGlobalToken('@kurdel/core/app:on-shutdown'),
};
//# sourceMappingURL=tokens.js.map