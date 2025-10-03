import { Newable } from '@kurdel/common';
import type { Middleware } from '../api/types.js';
import { Controller } from '../api/controller.js';
export declare class MiddlewareRegistry {
    private readonly global;
    private readonly perController;
    use(mw: Middleware): void;
    useFor(controller: Newable<{}>, mw: Middleware): void;
    all(): Middleware[];
    for(controller: Newable<Controller>): Middleware[];
}
