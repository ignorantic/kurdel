import { IncomingMessage, ServerResponse } from 'http';
import { Controller } from './controller.js';
export type Method = 'GET' | 'POST';
export type Route = {
    method: Method;
    path: string;
    handler: Function;
};
export declare class Router {
    private routes;
    constructor();
    addRoute(method: Method, path: string, controller: Controller, actionName: string): void;
    get(path: string, controller: Controller, actionName: string): void;
    post(path: string, controller: Controller, actionName: string): void;
    resolve(method: Method, url: string): Function | null;
    controllerAction(controller: Controller, actionName: string): (req: IncomingMessage, res: ServerResponse) => void;
}
