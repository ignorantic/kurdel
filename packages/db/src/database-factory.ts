import type { ISQLiteConfig } from './sqlite-driver.js';
import { SQLiteDriver } from './sqlite-driver.js';
import type { IPostgresConfig } from './postgres-driver.js';
import { PostgresDriver } from './postgres-driver.js';

export type ICombinedDatabaseConfig = ISQLiteConfig | IPostgresConfig;

export class DatabaseFactory {
  static createDriver(config: ICombinedDatabaseConfig) {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteDriver(config as ISQLiteConfig);
      case 'postgres':
        return new PostgresDriver(config as IPostgresConfig);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}
