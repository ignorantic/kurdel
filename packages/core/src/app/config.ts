import type { Newable } from '@kurdel/common';

import type { ServerAdapter } from 'src/http/interfaces.js';
import type { Model } from 'src/db/model.js';
import type { HttpModule } from 'src/http/http-module.js';

import type { AppModule } from './app-module.js';

export interface AppConfig {
  serverAdapter?: ServerAdapter;
  db?: boolean;
  models?: Newable<Model>[];
  modules?: (AppModule | HttpModule)[];
}
