import { Newable } from '@kurdel/common';
import { ServerAdapter } from '../http/interfaces.js';
import { Model } from '../db/model.js';
import { HttpModule } from '../http/http-module.js';
import { AppModule } from './app-module.js';
export interface AppConfig {
    server?: Newable<ServerAdapter>;
    db?: boolean;
    models?: Newable<Model>[];
    modules?: (AppModule | HttpModule)[];
}
