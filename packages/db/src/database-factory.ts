import { SQLiteDriver, ISQLiteConfig } from './sqlite-driver.js';

export type ICombinedDatabaseConfig = ISQLiteConfig;

export class DatabaseFactory {
  static createDriver(config: ICombinedDatabaseConfig) {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteDriver(config as ISQLiteConfig);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}
