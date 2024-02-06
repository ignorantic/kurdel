import { DatabaseDriver } from './database-driver.js';
import { IDatabaseConfig } from './interfaces.js';
import { SQLiteDB } from './sqlite-db.js';
export interface ISQLiteConfig extends IDatabaseConfig {
    filename: string;
}
export declare class SQLiteDriver extends DatabaseDriver<ISQLiteConfig> {
    private db?;
    constructor(config: ISQLiteConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get connection(): SQLiteDB | undefined;
}
