import { IoCContainer } from '@kurdel/ioc';
import { AppConfig } from '../config.js';
import { Initializer } from './initializer.js';

export class ServiceInitializer implements Initializer {
  run(ioc: IoCContainer, config: AppConfig) {
    config.services?.forEach((service) => {
      ioc.put(service);
    });
  }
}
