import { HttpRequest, HttpResponse, Method, Middleware } from './types.js';
import { ControllerConfig } from './interfaces.js';
import { ControllerResolver } from './controller-resolver.js';
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
    resolve(method: Method, url: string): ((req: HttpRequest, res: HttpResponse) => Promise<void> | void) | null;
}
