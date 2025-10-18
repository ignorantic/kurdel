import type { Container } from '@kurdel/ioc';
import type { HttpRequest, HttpResponse } from '@kurdel/common';

import type { Method } from 'src/http/types.js';
import type { ControllerConfig } from 'src/http/controller-config.js';
import type { ControllerResolver } from 'src/http/controller-resolver.js';
import type { Middleware } from 'src/http/middleware.js';

export interface RouterDeps {
  resolver: ControllerResolver;
  controllerConfigs: ControllerConfig[];
  middlewares: Middleware[];
}

export interface Router {
  middlewares: Middleware[];

  /** Prepare routes (called once at bootstrap) */
  init(deps: RouterDeps): void;

  /**
   * Find a handler for method+url; returns a callable or null
   * adapter вызовет его как handler(req, res)
   */
  resolve(
    method: Method,
    url: string,
    scope: Container
  ): ((req: HttpRequest, res: HttpResponse) => Promise<void> | void) | null;
}
