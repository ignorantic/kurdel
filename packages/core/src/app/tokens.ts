import { createGlobalToken } from '@kurdel/ioc';

import type { ServerAdapter } from '../http/interfaces.js';
import type { Router } from '../http/router.js';

import type { OnShutdownHook, OnStartHook } from './lifecycle.js';

export const TOKENS = {
  ServerAdapter: createGlobalToken<ServerAdapter>('@kurdel/core/app:server-adapter'),
  Router: createGlobalToken<Router>('@kurdel/core/app:router'),
  ControllerClasses: createGlobalToken('@kurdel/core/app:controller-classes'),
  ControllerConfigs: createGlobalToken('@kurdel/core/app:controller-configs'),
  MiddlewareRegistry: createGlobalToken('@kurdel/core/app:middleware-registry'),
  ControllerResolver: createGlobalToken('@kurdel/core/app:controller-resolver'),
  OnStart: createGlobalToken<OnStartHook[]>('@kurdel/core/app:on-start'),
  OnShutdown: createGlobalToken<OnShutdownHook[]>('@kurdel/core/app:on-shutdown'),
};
