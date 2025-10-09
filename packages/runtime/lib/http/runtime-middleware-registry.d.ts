import type { Newable } from '@kurdel/common';
import type { Controller } from '@kurdel/core/http';
import { type Middleware, type MiddlewareRegistry } from '@kurdel/core/http';
export declare class RuntimeMiddlewareRegistry implements MiddlewareRegistry {
    private readonly global;
    private readonly perController;
    use(mw: Middleware): void;
    useFor(controller: Newable<{}>, mw: Middleware): void;
    all(): Middleware[];
    for(controller: Newable<Controller>): Middleware[];
}
