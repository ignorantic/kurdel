import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from './app-module.js';
import { AppConfig } from '../config.js';

/**
 * ServiceModule
 *
 * - Registers application services from AppConfig
 * - Does not export anything directly (services consumed by controllers)
 */
export class ServiceModule implements AppModule<AppConfig> {
  async register(ioc: IoCContainer, config: AppConfig): Promise<void> {
    const { services = [] } = config;
    services.forEach((service) => ioc.put(service));
  }
}
