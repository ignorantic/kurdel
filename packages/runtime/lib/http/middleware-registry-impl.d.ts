import { Newable } from '@kurdel/common';
import { type Middleware, type MiddlewareRegistry, Controller } from '@kurdel/core/http';
export declare class MiddlewareRegistryImpl implements MiddlewareRegistry {
    private readonly global;
    private readonly perController;
    use(mw: Middleware): void;
    useFor(controller: Newable<{}>, mw: Middleware): void;
    all(): Middleware[];
    for(controller: Newable<Controller>): Middleware[];
}
