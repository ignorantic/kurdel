import { Newable } from '@kurdel/common';
import { IServerAdapter } from './http/interfaces.js';
import { Model } from './model.js';
import { AppModule } from './modules/app-module.js';
import { HttpModule } from './modules/http-module.js';
export declare const CONTROLLER_CLASSES: unique symbol;
export interface AppConfig {
    server?: Newable<IServerAdapter>;
    db?: boolean;
    models?: Newable<Model>[];
    modules?: (AppModule | HttpModule)[];
}
//# sourceMappingURL=config.d.ts.map