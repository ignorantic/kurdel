import { Container } from '@kurdel/ioc';
import type { Method, HttpRequest, HttpResponse } from '../../api/http/types.js';
import { ControllerConfig } from '../../api/http/interfaces.js';
import { Router } from '../../api/http/router.js';
import { ControllerResolver } from '../../api/http/controller-resolver.js';
import { Middleware } from '../../api/http/middleware.js';
interface RouterDeps {
    resolver: ControllerResolver;
    controllerConfigs: ControllerConfig[];
    middlewares: Middleware[];
}
export declare class RouterImpl implements Router {
    private entries;
    private middlewares;
    private resolver;
    init({ resolver, controllerConfigs, middlewares }: RouterDeps): void;
    use(mw: Middleware): void;
    /**
     * Resolve to a handler that now accepts (req, res, scope).
     * The scope is the per-request container created by the server adapter.
     */
    resolve(method: Method, url: string, scope: Container): ((req: HttpRequest, res: HttpResponse) => Promise<void>) | null;
    /**
     * Read RouteMeta from the controller's `routes` and register entries.
     * Note: we pass a token (ctor) to entries for request-time resolution.
     */
    private useController;
    private add;
}
export {};
