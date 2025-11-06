import type { Container } from '@kurdel/ioc';
import type { HttpRequest, HttpResponse } from '@kurdel/common';

import type {
  Method,
  ControllerConfig,
  ControllerResolver,
  ResponseRenderer,
  Middleware,
} from 'src/http/index.js';

export interface RouterDeps {
  resolver: ControllerResolver;
  renderer: ResponseRenderer;
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
