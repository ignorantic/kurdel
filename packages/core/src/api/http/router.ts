import type { Method, Middleware, ControllerResolver } from './types.js';
import type { ControllerConfig } from './interfaces.js';

export type HttpRequest = unknown;
export type HttpResponse = unknown;

export interface RouterDeps {
  resolver: ControllerResolver;
  controllerConfigs: ControllerConfig[];
  middlewares: Middleware[];
}

export interface Router {
  /** Prepare routes (called once at bootstrap) */
  init(deps: RouterDeps): void;

  /**
   * Find a handler for method+url; returns a callable or null
   * adapter вызовет его как handler(req, res)
   */
  resolve(
    method: Method,
    url: string
  ): ((req: HttpRequest, res: HttpResponse) => Promise<void> | void) | null;
}

