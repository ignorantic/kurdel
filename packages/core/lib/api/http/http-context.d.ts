import { IncomingMessage, ServerResponse } from 'http';
import { Query } from './types.js';
export interface HttpContext<TDeps = unknown, TBody = unknown> {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    query: Query;
    params: Record<string, string>;
    deps: TDeps;
    body?: TBody;
}
