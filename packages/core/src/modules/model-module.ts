import { IDatabase } from '@kurdel/db';
import { IoCContainer } from '@kurdel/ioc';
import { AppConfig } from '../config.js';
import { AppModule } from './app-module.js';

/**
 * ModelModule
 *
 * - Exports: none
 * - Imports: IDatabase
 *
 * Registers application models in the IoC container.
 * Each model receives the database instance automatically
 * injected through constructor parameter mapping.
 */
export const ModelModule: AppModule = {
  imports: { db: IDatabase },

  register(ioc: IoCContainer, config: AppConfig) {
    config.models?.forEach((model) => {
      ioc.put(model).with({ db: IDatabase });
    });
  },
};
