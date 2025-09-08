import type { Newable } from '@kurdel/common';
import { IncomingMessage, ServerResponse } from 'http';
import { Controller } from './controller.js';
import type { Method, ControllerResolver } from './types.js';
export declare class Router {
    private entries;
    constructor(resolver: ControllerResolver, controllers: Newable<Controller<any>>[]);
    private useController;
    private add;
    resolve(method: Method, url: string): ((req: IncomingMessage, res: ServerResponse) => void) | null;
}
//# sourceMappingURL=router.d.ts.map