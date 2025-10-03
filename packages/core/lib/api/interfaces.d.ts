import { Server } from 'http';
import { Newable } from '@kurdel/common';
import { Identifier } from '@kurdel/ioc';
import { Controller } from '../api/controller.js';
import { Model } from '../api/model.js';
import { Middleware } from '../api/types.js';
export interface ServerAdapter {
    listen(port: number, callback: Function): void;
    getHttpServer(): Server;
}
export interface RunningServer {
    /** e.g. http://127.0.0.1:3000 */
    url?: string;
    /** Graceful shutdown */
    close(): Promise<void>;
    /** Escape hatch for tests (e.g., Node http.Server) */
    raw?<T = unknown>(): T | undefined;
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
