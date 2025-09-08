import type { Newable } from '@kurdel/common';
import { IncomingMessage, ServerResponse } from 'http';
import { Controller } from './controller.js';
import type { Method, ControllerResolver, Middleware } from './types.js';
import { MiddlewareRegistry } from './middleware-registry.js';
export declare class Router {
    private entries;
    private middlewares;
    constructor(resolver: ControllerResolver, controllers: Newable<Controller<any>>[], registry: MiddlewareRegistry);
    private useController;
    private add;
    use(mw: Middleware): void;
    resolve(method: Method, url: string): ((req: IncomingMessage, res: ServerResponse) => void) | null;
}
//# sourceMappingURL=router.d.ts.map