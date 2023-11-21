import { IncomingMessage, ServerResponse } from 'http';
import { Controller } from './controller.js';
import { Method } from './types.js';
export declare class Router {
    private routes;
    constructor();
    useController<T>(controller: Controller<T>): void;
    private addRoute;
    resolve(method: Method, url: string): Function | null;
    controllerAction<T>(controller: Controller<T>, action: string): (req: IncomingMessage, res: ServerResponse) => void;
}
