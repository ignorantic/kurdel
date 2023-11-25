import { SQLiteDriver, SQLiteConfig } from './sqlite-driver.js';
export type CombinedDatabaseConfig = SQLiteConfig;
export declare class DatabaseFactory {
    static createDriver(config: CombinedDatabaseConfig): SQLiteDriver;
}
