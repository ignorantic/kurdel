import { Newable } from '@kurdel/common';

import { ServerAdapter } from 'src/http/interfaces.js';
import { Model } from 'src/db/model.js';
import { HttpModule } from 'src/http/http-module.js';

import { AppModule } from './app-module.js';

export interface AppConfig {
  server?: Newable<ServerAdapter>;
  db?: boolean;
  models?: Newable<Model>[];
  modules?: (AppModule | HttpModule)[];
}

