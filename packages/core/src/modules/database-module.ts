import { IoCContainer } from '@kurdel/ioc';
import { IDatabase, DBConnector } from '@kurdel/db';
import { AppModule } from './app-module.js';
import { AppConfig } from '../config.js';

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
      class NoopDatabase {
        async query() {
          throw new Error('Database disabled');
        }
      }
      ioc.bind(IDatabase).toInstance(new NoopDatabase());
      return;
    }

    const connector = new DBConnector();
    const connection = await connector.run();
    ioc.bind(IDatabase).toInstance(connection);
  }
}
