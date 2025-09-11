import { IoCContainer } from '@kurdel/ioc';
import { IDatabase } from '@kurdel/db';
import { AppConfig } from '../config.js';
import { Initializer } from './initializer.js';

export class ModelInitializer implements Initializer {
  run(ioc: IoCContainer, config: AppConfig) {
    config.models?.forEach((model) => {
      ioc.put(model).with({ db: IDatabase });
    });
  }
}
