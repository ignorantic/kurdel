import { createGlobalToken } from '@kurdel/ioc';

import type { ServerAdapter } from 'src/http/server-adapter.js';
import type { Router } from 'src/http/router.js';
import type { Controller } from 'src/http/controller.js';
import type { ControllerConfig } from 'src/http/controller-config.js';
import type { MiddlewareRegistry } from 'src/http/middleware-registry.js';
import type { ControllerResolver } from 'src/http/controller-resolver.js';

export const HTTP_TOKENS = {
  ServerAdapter: createGlobalToken<ServerAdapter>('@kurdel/core/hhtp:server-adapter'),
  Router: createGlobalToken<Router>('@kurdel/core/http:router'),
  ControllerClasses: createGlobalToken<Controller[]>('@kurdel/core/http:controller-classes'),
  ControllerConfigs: createGlobalToken<ControllerConfig[]>('@kurdel/core/http:controller-configs'),
  MiddlewareRegistry: createGlobalToken<MiddlewareRegistry>(
    '@kurdel/core/http:middleware-registry'
  ),
  ControllerResolver: createGlobalToken<ControllerResolver>(
    '@kurdel/core/http:controller-resolver'
  ),
};
