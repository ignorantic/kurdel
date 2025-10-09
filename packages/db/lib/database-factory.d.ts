import type { ISQLiteConfig } from './sqlite-driver.js';
import { SQLiteDriver } from './sqlite-driver.js';
export type ICombinedDatabaseConfig = ISQLiteConfig;
export declare class DatabaseFactory {
    static createDriver(config: ICombinedDatabaseConfig): SQLiteDriver;
}
