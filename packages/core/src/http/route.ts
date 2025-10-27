import type { Method } from 'src/http/types.js';
import type { HttpContext } from 'src/http/http-context.js';
import type { ActionResult } from 'src/http/action-result.js';

export const ROUTE_META = Symbol('@kurdel/core:route-meta');

export type RouteMeta<P extends string = string> = { method: Method; path: P };

type Split<S extends string> = S extends ''
  ? []
  : S extends `/${infer R}`
    ? Split<R>
    : S extends `${infer A}/${infer B}`
      ? [A, ...Split<B>]
      : [S];

type ParamName<Seg extends string> = Seg extends `:${infer Name}`
  ? Name
  : Seg extends `:${infer Name}<${string}>`
    ? Name // reserved for future constraints
    : never;

export type RouteParams<Path extends string> = {
  [K in ParamName<Split<Path>[number]>]: string;
} & {}; // keeps {} when no params

export type RouteHandler<
  TBody = unknown,
  TParams extends Record<string, string> = Record<string, string>,
> = (ctx: HttpContext<TBody, TParams>) => Promise<ActionResult>;

export type RouteConfig = {
  [key: string]: RouteHandler<any, any>;
};

/**
 * route(meta)(handler) preserves the handler and tags it with metadata.
 * Typing-wise, it narrows ctx.params for the handler from meta.path.
 */
export function route<const M extends RouteMeta>(meta: M) {
  return function <TBody = unknown>(fn: RouteHandler<TBody, RouteParams<M['path']>>): typeof fn {
    (fn as any)[ROUTE_META] = meta;
    return fn;
  };
}
