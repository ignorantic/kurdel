import { Newable } from '@kurdel/common';
import { Identifier } from '@kurdel/ioc';
import { IServerAdapter } from './http/interfaces.js';
import { Model } from './model.js';
import { Middleware } from './types.js';
export interface AppConfig {
    server?: Newable<IServerAdapter>;
    db?: Boolean;
    services?: Newable<{}>[];
    models?: Newable<Model>[];
    middlewares?: Middleware[];
    controllers?: [Newable<{}>, Identifier[]?, Middleware[]?][];
}
export declare const CONTROLLER_CLASSES: unique symbol;
export declare class Application {
    private config;
    private ioc;
    private dbConnector?;
    constructor(config: AppConfig);
    static create(config?: AppConfig): Promise<Application>;
    private init;
    listen(port: number, callback: () => void): void;
}
//# sourceMappingURL=application.d.ts.map