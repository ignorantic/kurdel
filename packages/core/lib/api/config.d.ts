import { Newable } from '@kurdel/common';
import { ServerAdapter } from '../api/interfaces.js';
import { Model } from '../api/model.js';
import { AppModule } from '../api/app-module.js';
import { HttpModule } from '../api/http-module.js';
export interface AppConfig {
    server?: Newable<ServerAdapter>;
    db?: boolean;
    models?: Newable<Model>[];
    modules?: (AppModule | HttpModule)[];
}
