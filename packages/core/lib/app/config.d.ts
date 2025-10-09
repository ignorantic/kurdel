import type { Newable } from '@kurdel/common';
import type { ServerAdapter } from '../http/interfaces.js';
import type { Model } from '../db/model.js';
import type { HttpModule } from '../http/http-module.js';
import type { AppModule } from './app-module.js';
export interface AppConfig {
    server?: Newable<ServerAdapter>;
    db?: boolean;
    models?: Newable<Model>[];
    modules?: (AppModule | HttpModule)[];
}
