import { JSONLoader } from '../json-loader.js';
import { CombinedDatabaseConfig, DatabaseFactory } from './database-factory.js';
import { IDatabase } from './interfaces.js';

export class DBConnector {
  private jsonLoader: JSONLoader;

  constructor() {
    this.jsonLoader = new JSONLoader();
  }

  public async run() {
    const dbConfig = this.jsonLoader.load('./db.config.json');
    return await this.establish(dbConfig);
  }

  private async establish(dbConfig: CombinedDatabaseConfig): Promise<IDatabase> {
    const driver = DatabaseFactory.createDriver(dbConfig);
    await driver.connect();
    if (!driver.connection) {
      throw new Error('Database connection failed');
    }
    return driver.connection;
  }
}

