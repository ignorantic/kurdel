import { Newable } from '@kurdel/common';
import { Identifier } from '@kurdel/ioc';
import { IServerAdapter } from './http/interfaces.js';
import { Model } from './model.js';
import { Middleware } from './types.js';
import { Controller } from './controller.js';
import { AppModule } from './modules/app-module.js';

export const CONTROLLER_CLASSES = Symbol('CONTROLLER_CLASSES');

export interface ControllerConfig {
  use: Newable<Controller<any>>;
  deps?: Record<string, Identifier>;
  middlewares?: Middleware[];
  prefix?: string;
}

export interface AppConfig {
  server?: Newable<IServerAdapter>;
  db?: boolean;
  services?: Newable<{}>[];
  models?: Newable<Model>[];
  middlewares?: Middleware[];
  controllers?: ControllerConfig[];
  modules?: AppModule[];
}
