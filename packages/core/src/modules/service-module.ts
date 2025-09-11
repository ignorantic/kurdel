import { IoCContainer } from '@kurdel/ioc';
import { AppConfig } from '../config.js';
import { AppModule } from './app-module.js';

/**
 * ServiceModule
 *
 * - Exports: none
 * - Imports: none
 *
 * Registers application services in the IoC container.
 * Services are typically plain classes that may depend
 * on models or other services.
 */
export const ServiceModule: AppModule = {
  register(ioc: IoCContainer, config: AppConfig) {
    config.services?.forEach((service) => {
      ioc.put(service);
    });
  },
};
