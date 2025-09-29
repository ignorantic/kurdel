import { Newable } from '@kurdel/common';
import { IServerAdapter } from 'src/api/interfaces.js';
import { Model } from 'src/api/model.js';
import { AppModule } from 'src/api/app-module.js';
import { HttpModule } from 'src/api/http-module.js';

export const CONTROLLER_CLASSES = Symbol('CONTROLLER_CLASSES');

export interface AppConfig {
  server?: Newable<IServerAdapter>;
  db?: boolean;
  models?: Newable<Model>[];
  modules?: (AppModule | HttpModule)[];
}

