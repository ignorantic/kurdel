import { Identifier, Newable } from './ioc-container.js';
import { Model } from './model.js';
export interface AppConfig {
    models: Newable<Model>[];
    controllers: [Newable<{}>, Identifier[]][];
}
export declare class Application {
    private config;
    private ioc;
    private dbConnector;
    constructor(config: AppConfig);
    static create(config: AppConfig): Promise<Application>;
    private init;
    private registerModels;
    private registerControllers;
    listen(port: number, callback: () => void): void;
}
