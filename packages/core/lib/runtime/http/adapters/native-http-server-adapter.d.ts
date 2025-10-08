import { type Server } from 'node:http';
import type { RequestLike, ResponseLike, ServerAdapter } from '../../../api/http/interfaces.js';
export declare class NativeHttpServerAdapter implements ServerAdapter<RequestLike, ResponseLike> {
    private readonly server;
    private handler?;
    constructor();
    on(cb: (req: RequestLike, res: ResponseLike) => void | Promise<void>): void;
    listen(port: number, hostOrCb?: string | (() => void), cb?: () => void): void;
    close(): Promise<void>;
    /** Unified raw getter used by ApplicationImpl/RunningServer. */
    raw<T = Server>(): T | undefined;
}
