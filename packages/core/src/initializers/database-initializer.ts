import { IDatabase, DBConnector } from '@kurdel/db';
import { IoCContainer } from '@kurdel/ioc';
import { AppConfig } from '../config.js';
import { Initializer } from './initializer.js';

export class DatabaseInitializer implements Initializer {
  async run(ioc: IoCContainer, config: AppConfig) {
    if (config.db === false) return;

    const connector = new DBConnector();
    try {
      const dbConnection = await connector.run();
      ioc.bind(IDatabase).toInstance(dbConnection);
    } catch (err) {
      throw new Error(`Application failed to init database: ${String(err)}`);
    }
  }
}
