import { Method } from "./types.js";
export declare const ROUTE_META: unique symbol;
export type RouteMeta = {
    method: Method;
    path: string;
};
export declare function route(meta: RouteMeta): <T extends Function>(fn: T) => T;
//# sourceMappingURL=routing.d.ts.map