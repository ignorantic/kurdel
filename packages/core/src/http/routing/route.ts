import type {
  Method,
  HttpContext,
  ActionResult,
  RouteSchema,
} from 'src/http/index.js';

export const ROUTE_META = Symbol('@kurdel/core:route-meta');

/**
 * Metadata describing a single route.
 */
export type RouteMeta<P extends string = string> = {
  method: Method;
  path: P;
  schema?: RouteSchema;
};

/* ──────────────────────────────────────────────────────────────────────────
 * Path parameter inference
 * Converts "/users/:id/books/:bookId" into { id: string; bookId: string }
 * ────────────────────────────────────────────────────────────────────────── */

type Split<S extends string> =
  S extends '' ? [] :
  S extends `/${infer R}` ? Split<R> :
  S extends `${infer A}/${infer B}` ? [A, ...Split<B>] :
  [S];

type ParamName<Seg extends string> =
  Seg extends `:${infer Name}` ? Name :
  Seg extends `:${infer Name}<${string}>` ? Name :  // reserved for constraints
  never;

export type RouteParams<Path extends string> = {
  [K in ParamName<Split<Path>[number]>]: string;
} & {}; // keeps {} when no params

/* ──────────────────────────────────────────────────────────────────────────
 * RouteHandler
 * Updated to match Runtime behavior:
 *  - may return ActionResult OR void (undefined)
 *  - void triggers ControllerActionMissingResultError in Orchestrator
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * A concrete action handler executed by runtime.
 *
 * TBody   = validated body type
 * TParams = validated params type
 */
export type RouteHandler<
  TBody = unknown,
  TParams extends Record<string, string> = Record<string, string>,
> = (ctx: HttpContext<TBody, TParams>) => Promise<ActionResult | void>;

/**
 * RouteConfig maps action names to handlers.
 */
export type RouteConfig = {
  [key: string]: RouteHandler<any, any>;
};

/* ──────────────────────────────────────────────────────────────────────────
 * route(meta)(handler)
 * Attaches metadata to a handler AND preserves the handler's identity.
 *
 * Important: handler is NOT wrapped.
 * RuntimeControllerPipe calls handler.call(controller, ctx),
 * so the function MUST be the original method reference.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Decorates the given handler with metadata (method, path, schema).
 *
 * Typing also narrows ctx.params based on meta.path automatically.
 */
export function route<const M extends RouteMeta>(meta: M) {
  return function <
    TBody = unknown,
    P extends RouteParams<M['path']> = RouteParams<M['path']>
  >(fn: RouteHandler<TBody, P>): typeof fn {
    (fn as any)[ROUTE_META] = meta;
    return fn;
  };
}
