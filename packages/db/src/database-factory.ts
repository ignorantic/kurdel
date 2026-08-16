import type { SQLiteConfig } from './sqlite-driver.js';
import { SQLiteDriver } from './sqlite-driver.js';
import type { PostgresConfig } from './postgres-driver.js';
import { PostgresDriver } from './postgres-driver.js';

export type DatabaseDriverConfig = SQLiteConfig | PostgresConfig;

export class DatabaseFactory {
  static createDriver(config: DatabaseDriverConfig) {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteDriver(config as SQLiteConfig);
      case 'postgres':
        return new PostgresDriver(config as PostgresConfig);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}
