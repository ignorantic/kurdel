import { IoCContainer } from '@kurdel/ioc';
import { IDatabase } from '@kurdel/db';
import { AppModule } from './app-module.js';
import { AppConfig } from '../config.js';

/**
 * ModelModule
 *
 * - Registers application models from AppConfig
 * - Models depend on IDatabase
 */
export class ModelModule implements AppModule<AppConfig> {
  readonly imports = { db: IDatabase };

  async register(ioc: IoCContainer, config: AppConfig): Promise<void> {
    const { models = [] } = config;
    models.forEach((model) => ioc.put(model).with({ db: IDatabase }));
  }
}
