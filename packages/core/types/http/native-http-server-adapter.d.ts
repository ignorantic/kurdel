import { Router } from '../router.js';
import { IHttpServerAdapter } from './interfaces.js';
export declare class NativeHttpServerAdapter implements IHttpServerAdapter {
    private server;
    constructor(router: Router);
    listen(port: number, callback: () => void): void;
}
