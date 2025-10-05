import { Newable } from '@kurdel/common';
import { ServerAdapter } from '../../api/http/interfaces.js';
import { Model } from '../../api/model.js';
import { AppModule } from '../../api/app/app-module.js';
import { HttpModule } from '../../api/http-module.js';
export interface AppConfig {
    server?: Newable<ServerAdapter>;
    db?: boolean;
    models?: Newable<Model>[];
    modules?: (AppModule | HttpModule)[];
}
