import { Router } from './router.js';
export interface HttpServer {
    listen(port: number, callback: Function): void;
}
export declare class NativeServer implements HttpServer {
    private server;
    constructor(router: Router);
    listen(port: number, callback: () => void): void;
}
