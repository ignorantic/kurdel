import { JSONLoader } from '@kurdel/common';
import { DB_CONFIG_FILENAME } from './consts.js';
import { ICombinedDatabaseConfig, DatabaseFactory } from './database-factory.js';
import { IDatabase } from './interfaces.js';

export class DBConnector {
  private jsonLoader: JSONLoader;

  constructor() {
    this.jsonLoader = new JSONLoader();
  }

  public async run(): Promise<IDatabase> {
    const dbConfig = this.jsonLoader.load(DB_CONFIG_FILENAME);
    return this.establish(dbConfig);
  }

  private async establish(dbConfig: ICombinedDatabaseConfig): Promise<IDatabase> {
    const driver = DatabaseFactory.createDriver(dbConfig);
    await driver.connect();
    if (!driver.connection) {
      throw new Error('Database connection failed');
    }
    return driver.connection;
  }
}

