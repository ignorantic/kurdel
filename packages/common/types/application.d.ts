import { Newable } from './types.js';
import { HttpServerAdapter } from './http/interfaces.js';
import { Identifier } from './ioc-container.js';
import { Model } from './model.js';
export interface AppConfig {
    http?: Newable<HttpServerAdapter>;
    models?: Newable<Model>[];
    controllers?: [Newable<{}>, Identifier[]][];
}
export declare class Application {
    private config;
    private ioc;
    private dbConnector;
    constructor(config: AppConfig);
    static create(config?: AppConfig): Promise<Application>;
    private init;
    listen(port: number, callback: () => void): void;
}
