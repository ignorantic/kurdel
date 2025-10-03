import type { Query } from '../../api/types.js';
import { IncomingMessage } from 'http';
export declare function buildURL(req: IncomingMessage): URL;
export declare function toQuery(u: URL): Query;
