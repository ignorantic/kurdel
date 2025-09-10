import { Newable } from '@kurdel/common';
import { Identifier, IoCContainer } from '@kurdel/ioc';
import { IServerAdapter } from './http/interfaces.js';
import { Model } from './model.js';
import { Middleware } from './types.js';
import { Controller } from './controller.js';
interface ControllerConfig {
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
export declare const CONTROLLER_CLASSES: unique symbol;
export declare class Application {
    private config;
    private ioc;
    private dbConnector?;
    constructor(config: AppConfig);
    getContainer(): IoCContainer;
    static create(config?: AppConfig): Promise<Application>;
    private init;
    listen(port: number, callback: () => void): void;
}
export {};
//# sourceMappingURL=application.d.ts.map