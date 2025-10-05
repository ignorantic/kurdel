import type { Method, Middleware, HttpRequest, HttpResponse } from '../../api/http/types.js';
import { ControllerConfig, Router, ControllerResolver } from '../../api/http/interfaces.js';
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
