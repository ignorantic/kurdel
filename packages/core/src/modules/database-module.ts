import { IDatabase, DBConnector, DatabaseQuery } from '@kurdel/db';
import { IoCContainer } from '@kurdel/ioc';
import { AppConfig } from '../config.js';
import { AppModule } from './app-module.js';

class NoopDatabase implements IDatabase {
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
 * - Exports: IDatabase (DB connection)
 * - Imports: none
 *
 * Responsible for creating a database connection (via DBConnector)
 * and binding it into the IoC container as a singleton instance.
 */
export const DatabaseModule: AppModule = {
  exports: { db: IDatabase },

  async register(ioc: IoCContainer, config: AppConfig) {
    if (config.db === false) {
      // bind stub instead of trying to run DBConnector
      ioc.bind(IDatabase).toInstance(new NoopDatabase());
      return;
    }

    const connector = new DBConnector();
    const dbConnection = await connector.run();
    ioc.bind(IDatabase).toInstance(dbConnection);
  },
};
