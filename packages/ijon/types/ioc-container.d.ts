import { Newable } from './types.js';
export type Identifier<T = unknown> = string | symbol | Newable<T>;
export declare class IoCContainer {
    private readonly dependencies;
    register<T>(name: Identifier<T>, constructor: {
        new (...args: any[]): T;
    }, dependencies: Identifier[]): void;
    registerInstance<T>(name: Identifier<T>, instance: T): void;
    put<T>(constructor: {
        new (...args: any[]): T;
    }, dependencies: Identifier[]): void;
    get<T>(name: Identifier<T>): T;
}
