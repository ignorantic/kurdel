import { HttpContext } from './http-context.js';
import { ActionResult, Method } from './types.js';

export const ROUTE_META = Symbol('route:meta');

export type RouteMeta<P extends string = string> = { method: Method; path: P }

type Split<S extends string> =
  S extends '' ? [] :
  S extends `/${infer R}` ? Split<R> :
  S extends `${infer A}/${infer B}` ? [A, ...Split<B>] :
  [S];

type ParamName<Seg extends string> =
  Seg extends `:${infer Name}` ? Name :
  Seg extends `:${infer Name}<${string}>` ? Name : // reserved for future constraints
  never;

export type RouteParams<Path extends string> = {
  [K in ParamName<Split<Path>[number]>]: string
} & {}; // keeps {} when no params

export type RouteHandler<
  TDeps,
  TBody = unknown,
  TParams extends Record<string, string> = Record<string, string>
> = (ctx: HttpContext<TDeps, TBody, TParams>) => Promise<ActionResult>;

export type RouteConfig<TDeps> = {
  [key: string]: RouteHandler<TDeps, any, any>;
};

/**
 * route(meta)(handler) preserves the handler and tags it with metadata.
 * Typing-wise, it narrows ctx.params for the handler from meta.path.
 */
export function route<P extends string>(meta: RouteMeta<P>) {
  return function <
    TDeps,
    TBody = unknown,
    TParams extends Record<string, string> = RouteParams<P>,
    THandler extends RouteHandler<TDeps, TBody, TParams> = RouteHandler<TDeps, TBody, TParams>
  >(fn: THandler): THandler {
    const wrapped = function (this: any, ...args: any[]) {
      return (fn as any).apply(this, args);
    } as THandler;
    (wrapped as any)[ROUTE_META] = meta;
    return wrapped;
  };
}
