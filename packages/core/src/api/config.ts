import { Newable } from '@kurdel/common';
import { ServerAdapter } from 'src/api/interfaces.js';
import { Model } from 'src/api/model.js';
import { AppModule } from 'src/api/app-module.js';
import { HttpModule } from 'src/api/http-module.js';

export interface AppConfig {
  server?: Newable<ServerAdapter>;
  db?: boolean;
  models?: Newable<Model>[];
  modules?: (AppModule | HttpModule)[];
}

