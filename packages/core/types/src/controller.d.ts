import { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { RouteConfig } from './types.js';
export declare abstract class Controller<T = {}> {
    private _request?;
    private _response?;
    private _query?;
    private _responded;
    abstract readonly routes: RouteConfig<T>;
    execute(request: IncomingMessage, response: ServerResponse, actionName: string): Promise<void>;
    /** Allow only own, public methods and ones present in routes */
    private resolveAction;
    /** Send JSON response once (ignores subsequent calls) */
    send(statusCode: number, data: Record<string, unknown>): void;
    sendError(statusCode: number, message: string): void;
    get query(): ParsedUrlQuery;
}
