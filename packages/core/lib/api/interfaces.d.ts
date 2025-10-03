import { Newable } from '@kurdel/common';
import { Identifier } from '@kurdel/ioc';
import { Controller } from '../api/controller.js';
import { Model } from '../api/model.js';
import { Middleware } from '../api/types.js';
export interface ServerAdapter {
    listen(port: number, callback: Function): void;
    getHttpServer(): import('http').Server;
}
export interface ControllerConfig {
    /** Controller class */
    use: Newable<Controller<any>>;
    /** Dependencies to be injected from IoC */
    deps?: Record<string, Identifier>;
    /** Middlewares applied only to this controller */
    middlewares?: Middleware[];
    /** Optional route prefix applied to all controller routes */
    prefix?: string;
}
export interface ModelConfig {
    /** Controller class */
    use: Newable<Model>;
    /** Dependencies to be injected from IoC */
    deps?: Record<string, Identifier>;
}
export type ModelList = (Newable<Model> | ModelConfig)[];
