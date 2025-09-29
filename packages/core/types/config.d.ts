import { Newable } from '@kurdel/common';
import { IServerAdapter } from './api/interfaces.js';
import { Model } from './model.js';
import { AppModule } from './runtime/modules/app-module.ts';
import { HttpModule } from './runtime/modules/http-module.ts';
export declare const CONTROLLER_CLASSES: unique symbol;
export interface AppConfig {
    server?: Newable<IServerAdapter>;
    db?: boolean;
    models?: Newable<Model>[];
    modules?: (AppModule | HttpModule)[];
}
//# sourceMappingURL=config.d.ts.map
