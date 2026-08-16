import { JSONLoader } from '@kurdel/common';
import { DB_CONFIG_FILENAME } from './consts.js';
import type { DatabaseDriverConfig } from './database-factory.js';
import { DatabaseFactory } from './database-factory.js';
import type { Database } from './interfaces.js';

export class DBConnector {
  private jsonLoader: JSONLoader;

  constructor() {
    this.jsonLoader = new JSONLoader();
  }

  public async run(): Promise<Database> {
    try {
      const dbConfig = this.jsonLoader.load(DB_CONFIG_FILENAME);
      return this.establish(dbConfig);
    } catch (err) {
      throw new Error(`Database connection failed: ${String(err)}`);
    }
  }

  private async establish(dbConfig: DatabaseDriverConfig): Promise<Database> {
    const driver = DatabaseFactory.createDriver(dbConfig);
    await driver.connect();
    if (!driver.connection) {
      throw new Error('Database connection failed');
    }
    return driver.connection;
  }
}
