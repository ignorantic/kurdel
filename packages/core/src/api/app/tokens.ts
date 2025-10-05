import { createGlobalToken } from '@kurdel/ioc';
import { ServerAdapter, Router } from '../http/interfaces.js';

export const TOKENS = {
  ServerAdapter: createGlobalToken<ServerAdapter>('SERVER_ADAPTER'),
  Router: createGlobalToken<Router>('ROUTER'),
  ControllerClasses: createGlobalToken('CONTROLLER_CLASSES'),
  ControllerConfigs: createGlobalToken('CONTROLLER_CONFIGS'),
  MiddlewareRegistry: createGlobalToken('MIDDLEWARE_REGISTRY'),
  ControllerResolver: createGlobalToken('CONTROLLER_RESOLVER'),
};
