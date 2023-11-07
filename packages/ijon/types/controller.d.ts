/// <reference types="node" resolution-mode="require"/>
import { IncomingMessage, ServerResponse } from 'http';
export declare class Controller {
    private request?;
    private response?;
    execute(request: IncomingMessage, response: ServerResponse, actionName: string): Promise<void>;
    send(statusCode: number, data: Record<string, unknown>): void;
    sendError(statusCode: number, message: string): void;
}
