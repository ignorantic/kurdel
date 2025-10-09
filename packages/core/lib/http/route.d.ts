import type { HttpContext } from './http-context.js';
import type { ActionResult, Method } from './types.js';
export declare const ROUTE_META: unique symbol;
export type RouteMeta<P extends string = string> = {
    method: Method;
    path: P;
};
type Split<S extends string> = S extends '' ? [] : S extends `/${infer R}` ? Split<R> : S extends `${infer A}/${infer B}` ? [A, ...Split<B>] : [S];
type ParamName<Seg extends string> = Seg extends `:${infer Name}` ? Name : Seg extends `:${infer Name}<${string}>` ? Name : never;
export type RouteParams<Path extends string> = {
    [K in ParamName<Split<Path>[number]>]: string;
} & {};
export type RouteHandler<TDeps, TBody = unknown, TParams extends Record<string, string> = Record<string, string>> = (ctx: HttpContext<TDeps, TBody, TParams>) => Promise<ActionResult>;
export type RouteConfig<TDeps> = {
    [key: string]: RouteHandler<TDeps, any, any>;
};
/**
 * route(meta)(handler) preserves the handler and tags it with metadata.
 * Typing-wise, it narrows ctx.params for the handler from meta.path.
 */
export declare function route<const M extends RouteMeta>(meta: M): <TDeps, TBody = unknown>(fn: RouteHandler<TDeps, TBody, RouteParams<M["path"]>>) => typeof fn;
export {};
