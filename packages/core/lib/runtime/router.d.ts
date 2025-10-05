import type { Method, ControllerResolver, Middleware } from '../api/http/types.js';
import { ControllerConfig } from '../api/http/interfaces.js';
import { HttpRequest, HttpResponse, Router } from '../api/http/router.js';
interface RouterDeps {
    resolver: ControllerResolver;
    controllerConfigs: ControllerConfig[];
    middlewares: Middleware[];
}
export declare class RouterImpl implements Router {
    private entries;
    private middlewares;
    init({ resolver, controllerConfigs, middlewares }: RouterDeps): void;
    private useController;
    private add;
    use(mw: Middleware): void;
    resolve(method: Method, url: string): ((req: HttpRequest, res: HttpResponse) => void) | null;
}
export {};
