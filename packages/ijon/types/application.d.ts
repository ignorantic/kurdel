import { IoCContainer } from './ioc-container.js';
import { CombinedDatabaseConfig } from './db/database-factory.js';
export interface AppConfig {
    port: number;
    database: CombinedDatabaseConfig;
}
export declare class Application {
    private config;
    private ioc;
    constructor(config: AppConfig, ioc: IoCContainer);
    start(): Promise<void>;
    connect(): Promise<void>;
    listen(port: number, callback: () => void): void;
}
