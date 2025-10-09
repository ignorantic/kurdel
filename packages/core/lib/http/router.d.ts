import { Container } from '@kurdel/ioc';
import { HttpRequest, HttpResponse, Method } from './types.js';
import { ControllerConfig } from './interfaces.js';
import { ControllerResolver } from './controller-resolver.js';
import { Middleware } from './middleware.js';
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
    resolve(method: Method, url: string, scope: Container): ((req: HttpRequest, res: HttpResponse) => Promise<void> | void) | null;
}
