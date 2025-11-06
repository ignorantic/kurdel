import type { Newable } from '@kurdel/common';

import type { Model } from 'src/db/index.js';
import type { HttpModule } from 'src/http/index.js';
import type { AppModule } from 'src/app/index.js';

export interface AppConfig {
  db?: boolean;
  models?: Newable<Model>[];
  modules?: (AppModule | HttpModule)[];
}
