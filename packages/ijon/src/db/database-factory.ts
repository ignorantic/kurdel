import { SQLiteDriver, SQLiteConfig } from './sqlite-driver.js';

export type CombinedDatabaseConfig = SQLiteConfig;

export class DatabaseFactory {
  static createDriver(config: CombinedDatabaseConfig) {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteDriver(config as SQLiteConfig);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}
