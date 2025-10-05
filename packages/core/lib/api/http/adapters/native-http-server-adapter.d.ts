import { IncomingMessage, Server, ServerResponse } from 'http';
import { ServerAdapter } from '../interfaces.js';
export declare class NativeHttpServerAdapter implements ServerAdapter<IncomingMessage, ServerResponse> {
    private server;
    on(h: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>): void;
    listen(port: number, callback: () => void): void;
    getHttpServer(): Server;
}
