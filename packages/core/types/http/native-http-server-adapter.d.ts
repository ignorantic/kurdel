import { Server } from 'http';
import { Router } from '../router.js';
import { IServerAdapter } from './interfaces.js';
type Deps = {
    router: Router;
};
export declare class NativeHttpServerAdapter implements IServerAdapter {
    private deps;
    private server;
    constructor(deps: Deps);
    listen(port: number, callback: () => void): void;
    getHttpServer(): Server;
}
export {};
//# sourceMappingURL=native-http-server-adapter.d.ts.map