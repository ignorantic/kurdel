import { Identifier, Newable } from './ioc-container.js';
import { CombinedDatabaseConfig } from './db/database-factory.js';
import { Model } from './model.js';
import { Controller } from 'controller.js';
export interface AppConfig {
    port: number;
    database: CombinedDatabaseConfig;
    models: Newable<Model>[];
    controllers: [Newable<Controller>, Identifier[]][];
}
export declare class Application {
    private config;
    private ioc;
    constructor(config: AppConfig);
    start(): Promise<void>;
    connect(): Promise<void>;
    register(): void;
    listen(port: number, callback: () => void): void;
}
