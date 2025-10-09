import type { IncomingMessage } from '../http';
import type { Query } from '../http/types.js';
export declare function buildURL(req: IncomingMessage): URL;
export declare function toQuery(u: URL): Query;
