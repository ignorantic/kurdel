/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { RouteConfig } from './types.js';
export declare abstract class Controller<T = unknown> {
    private _request?;
    private _response?;
    private _query?;
    abstract readonly routes: RouteConfig<T>;
    execute(request: IncomingMessage, response: ServerResponse, actionName: string): Promise<void>;
    send(statusCode: number, data: Record<string, unknown>): void;
    sendError(statusCode: number, message: string): void;
    get query(): ParsedUrlQuery;
}
