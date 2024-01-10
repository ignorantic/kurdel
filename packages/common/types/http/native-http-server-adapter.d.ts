import { Router } from '../router.js';
import { HttpServerAdapter } from './interfaces.js';
export declare class NativeHttpServerAdapter implements HttpServerAdapter {
    private server;
    constructor(router: Router);
    listen(port: number, callback: () => void): void;
}
