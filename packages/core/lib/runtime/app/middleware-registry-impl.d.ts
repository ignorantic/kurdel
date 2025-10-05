import { Newable } from '@kurdel/common';
import type { Middleware } from '../../api/http/types.js';
import { Controller } from '../../api/http/controller.js';
import { MiddlewareRegistry } from '../../api/http/middleware-registry.js';
export declare class MiddlewareRegistryImpl implements MiddlewareRegistry {
    private readonly global;
    private readonly perController;
    use(mw: Middleware): void;
    useFor(controller: Newable<{}>, mw: Middleware): void;
    all(): Middleware[];
    for(controller: Newable<Controller>): Middleware[];
}
