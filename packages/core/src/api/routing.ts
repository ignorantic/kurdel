import { Method } from 'src/api/http/types.js';

export const ROUTE_META = Symbol('route:meta');

export type RouteMeta = { method: Method; path: string };

export function route(meta: RouteMeta) {
  return function <T extends (...args: any[]) => any>(fn: T): T {
    const wrapped = function (this: any, ...args: any[]) {
      return fn.apply(this, args);
    } as T;
    (wrapped as any)[ROUTE_META] = meta;
    return wrapped;
  };
}

