import type { Query } from '../../api/http/types.js';
import { IncomingMessage } from 'http';
export declare function buildURL(req: IncomingMessage): URL;
export declare function toQuery(u: URL): Query;
