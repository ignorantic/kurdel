import { IncomingMessage, ServerResponse } from 'http';
import { ActionResult, JsonValue, Query } from './types.js';
export interface HttpContext<TDeps = unknown, TBody = unknown, TParams = Record<string, string>> {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    query: Query;
    params: TParams;
    deps: TDeps;
    body?: TBody;
    json(status: number, body: JsonValue): ActionResult;
    text(status: number, body: string): ActionResult;
    redirect(status: number, location: string): ActionResult;
    noContent(): ActionResult;
}
