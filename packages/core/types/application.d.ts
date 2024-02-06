import { Newable } from '@kurdel/common';
import { Identifier } from '@kurdel/ioc';
import { IServerAdapter } from './http/interfaces.js';
import { Model } from './model.js';
export interface AppConfig {
    server?: Newable<IServerAdapter>;
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
