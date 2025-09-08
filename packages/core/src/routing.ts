import { Method } from "./types.js";

export const ROUTE_META = Symbol('route:meta');

export type RouteMeta = { method: Method; path: string };

export function route(meta: RouteMeta) {
  return function <T extends Function>(fn: T): T {
    (fn as any)[ROUTE_META] = meta;
    return fn;
  };
}
