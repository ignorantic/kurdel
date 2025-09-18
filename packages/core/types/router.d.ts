import { IncomingMessage, ServerResponse } from 'http';
import type { Method, ControllerResolver, Middleware } from './types.js';
import { MiddlewareRegistry } from './middleware-registry.js';
import { ControllerConfig } from './http/interfaces.js';
interface RouterDeps {
    resolver: ControllerResolver;
    controllerConfigs: ControllerConfig[];
    registry: MiddlewareRegistry;
}
export declare class Router {
    private entries;
    private middlewares;
    constructor({ resolver, controllerConfigs, registry }: RouterDeps);
    private useController;
    private add;
    use(mw: Middleware): void;
    resolve(method: Method, url: string): ((req: IncomingMessage, res: ServerResponse) => void) | null;
}
export {};
//# sourceMappingURL=router.d.ts.map