import type { IoCContainer } from '@kurdel/ioc';
import { Database, DBConnector, type DatabaseDialect } from '@kurdel/db';
import type { AppConfig, AppModule, OnShutdownHook } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';

export class NoopDatabase implements Database {
  get dialect(): DatabaseDialect {
    throw new Error('Database is disabled (db=false in config)');
  }
  query = this.error;
  get = this.error;
  all = this.error;
  run = this.error;
  async transaction<T>(): Promise<T> {
    throw new Error('Database is disabled (db=false in config)');
  }
  close = this.error;

  private async error() {
    throw new Error('Database is disabled (db=false in config)');
  }
}

/**
 * DatabaseModule
 *
 * - Provides a database connection if enabled
 * - Exports the Database token
 * - Falls back to NoopDatabase when disabled
 */
export class DatabaseModule implements AppModule<AppConfig> {
  readonly exports = { db: Database };

  async register(ioc: IoCContainer, config: AppConfig): Promise<void> {
    if (config.db === false) {
      ioc.bind(Database).toInstance(new NoopDatabase());
      return;
    }

    const connector = new DBConnector();
    const connection = await connector.run();
    ioc.bind(Database).toInstance(connection);
    ioc.get<OnShutdownHook[]>(TOKENS.OnShutdown).push(() => connection.close());
  }
}
