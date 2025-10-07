import { Method } from './types.js';
export declare const ROUTE_META: unique symbol;
export type RouteMeta = {
    method: Method;
    path: string;
};
export declare function route(meta: RouteMeta): <T extends (...args: any[]) => any>(fn: T) => T;
