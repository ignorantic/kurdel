import { IoCContainer } from '@kurdel/ioc';
import { IDatabase, DBConnector } from '@kurdel/db';
import { AppModule } from 'src/api/app-module.js';
import { AppConfig } from 'src/api/config.js';

export class NoopDatabase implements IDatabase {
  query = this.error;
  get = this.error;
  all = this.error;
  run = this.error;
  close = this.error;
  
  private async error() {
    throw new Error('Database is disabled (db=false in config)');
  }
}

/**
 * DatabaseModule
 *
 * - Provides a database connection if enabled
 * - Exports the IDatabase token
 * - Falls back to NoopDatabase when disabled
 */
export class DatabaseModule implements AppModule<AppConfig> {
  readonly exports = { db: IDatabase };

  async register(ioc: IoCContainer, config: AppConfig): Promise<void> {
    if (config.db === false) {
      ioc.bind(IDatabase).toInstance(new NoopDatabase());
      return;
    }

    const connector = new DBConnector();
    const connection = await connector.run();
    ioc.bind(IDatabase).toInstance(connection);
  }
}
