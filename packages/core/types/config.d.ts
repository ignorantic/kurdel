import { Newable } from '@kurdel/common';
import { Identifier } from '@kurdel/ioc';
import { IServerAdapter } from './http/interfaces.js';
import { Model } from './model.js';
import { Middleware } from './types.js';
import { Controller } from './controller.js';
export declare const CONTROLLER_CLASSES: unique symbol;
export interface ControllerConfig {
    use: Newable<Controller<any>>;
    deps?: Record<string, Identifier>;
    middlewares?: Middleware[];
    prefix?: string;
}
export interface AppConfig {
    server?: Newable<IServerAdapter>;
    db?: boolean;
    services?: Newable<{}>[];
    models?: Newable<Model>[];
    middlewares?: Middleware[];
    controllers?: ControllerConfig[];
}
//# sourceMappingURL=config.d.ts.map