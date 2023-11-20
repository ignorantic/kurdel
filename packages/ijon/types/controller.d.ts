/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
export declare class Controller {
    private _request?;
    private _response?;
    private _query?;
    execute(request: IncomingMessage, response: ServerResponse, actionName: string): Promise<void>;
    protected get query(): ParsedUrlQuery;
    send(statusCode: number, data: Record<string, unknown>): void;
    sendError(statusCode: number, message: string): void;
}
