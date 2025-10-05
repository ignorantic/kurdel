import { createGlobalToken } from '@kurdel/ioc';
export const TOKENS = {
    ServerAdapter: createGlobalToken('SERVER_ADAPTER'),
    Router: createGlobalToken('ROUTER'),
    ControllerClasses: createGlobalToken('CONTROLLER_CLASSES'),
    ControllerConfigs: createGlobalToken('CONTROLLER_CONFIGS'),
    MiddlewareRegistry: createGlobalToken('MIDDLEWARE_REGISTRY'),
    ControllerResolver: createGlobalToken('CONTROLLER_RESOLVER'),
};
//# sourceMappingURL=tokens.js.map