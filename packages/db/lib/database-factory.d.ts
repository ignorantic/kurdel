import { SQLiteDriver, ISQLiteConfig } from './sqlite-driver.js';
export type ICombinedDatabaseConfig = ISQLiteConfig;
export declare class DatabaseFactory {
    static createDriver(config: ICombinedDatabaseConfig): SQLiteDriver;
}
