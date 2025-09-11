import { IoCContainer } from '@kurdel/ioc';
import { AppConfig } from '../config.js';

export interface Initializer {
  run(ioc: IoCContainer, config: AppConfig): Promise<void> | void;
}
