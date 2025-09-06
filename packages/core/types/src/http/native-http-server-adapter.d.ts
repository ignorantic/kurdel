import { Router } from '../router.js';
import { IServerAdapter } from './interfaces.js';
export declare class NativeHttpServerAdapter implements IServerAdapter {
    private server;
    constructor(router: Router);
    listen(port: number, callback: () => void): void;
}
