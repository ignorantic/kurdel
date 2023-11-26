import { DatabaseDriver } from './database-driver.js';
import { DatabaseConfig } from './interfaces.js';
import { SQLiteDB } from './sqlite-db.js';
export interface SQLiteConfig extends DatabaseConfig {
    filename: string;
}
export declare class SQLiteDriver extends DatabaseDriver<SQLiteConfig> {
    private db?;
    constructor(config: SQLiteConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get connection(): SQLiteDB | undefined;
}
