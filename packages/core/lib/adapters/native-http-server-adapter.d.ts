import { Server } from 'http';
import { Router } from '../runtime/router.js';
import { ServerAdapter } from '../api/interfaces.js';
type Deps = {
    router: Router;
};
export declare class NativeHttpServerAdapter implements ServerAdapter {
    private deps;
    private server;
    constructor(deps: Deps);
    listen(port: number, callback: () => void): void;
    getHttpServer(): Server;
}
export {};
