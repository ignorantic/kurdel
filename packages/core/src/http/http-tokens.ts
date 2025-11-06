import { createGlobalToken } from '@kurdel/ioc';

import type {
  ServerAdapter,
  Router,
  Controller,
  ControllerConfig,
  MiddlewareRegistry,
  ControllerResolver,
  ResponseRenderer,
} from 'src/http/index.js';

export const HTTP_TOKENS = {
  ServerAdapter: createGlobalToken<ServerAdapter>('@kurdel/core/hhtp:server-adapter'),
  Router: createGlobalToken<Router>('@kurdel/core/http:router'),
  ControllerClasses: createGlobalToken<Controller[]>('@kurdel/core/http:controller-classes'),
  ControllerConfigs: createGlobalToken<ControllerConfig[]>('@kurdel/core/http:controller-configs'),
  MiddlewareRegistry: createGlobalToken<MiddlewareRegistry>('@kurdel/core/http:middleware-registry'),
  ControllerResolver: createGlobalToken<ControllerResolver>('@kurdel/core/http:controller-resolver'),
  ResponseRenderer: createGlobalToken<ResponseRenderer>('@kurdel/core/http:response-renderer'),
};
