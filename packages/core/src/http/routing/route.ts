import type {
  Method,
  HttpContext,
  ActionResult,
  RouteSchema,
} from 'src/http/index.js';

export const ROUTE_META = Symbol('@kurdel/core:route-meta');

/**
 * ## RouteAuth
 *
 * Declarative authentication/authorization rules attached to a route
 * or inherited from its controller.
 *
 * A route becomes protected **only if at least one auth field is present**
 * (unless explicitly marked as `public: true`).
 *
 * ### Semantics
 * - `public: true`
 *     Marks a route as publicly accessible, bypassing authentication entirely.
 *     This **overrides controller-level security**.
 *
 * - `strategy`
 *     Name of an authentication strategy registered in `AuthStrategyRegistry`
 *     (e.g. `"api-key"`, `"jwt"`, `"session"`).
 *     If set, the corresponding strategy is invoked before controller execution.
 *
 * - `roles`
 *     List of roles required for access.
 *     Authorization succeeds if the authenticated user has **at least one**
 *     matching role.
 *
 * ### Controller-level vs Route-level
 * Controller `auth` rules act as defaults and are *merged* with route rules.
 * Route-level fields override controller-level ones:
 *
 * - `public` overrides everything (`public: true` makes route open even inside
 *   protected controller)
 * - `strategy` overrides controller strategy
 * - `roles` override controller roles
 *
 * @example:
 * ```ts
 * // Public route (even inside protected controller)
 * { public: true }
 *
 * // Simple protected route
 * { strategy: 'api-key' }
 *
 * // Role-restricted route
 * { strategy: 'api-key', roles: ['admin', 'root'] }
 *
 * // Controller-level default + route override:
 * controller.auth = { strategy: 'jwt', roles: ['user'] }
 * route.auth      = { roles: ['manager'] } // => result: { strategy: 'jwt', roles: ['manager'] }
 * ```
 */
export type RouteAuth = {
  /** Allows bypassing all authentication. Route is always accessible. */
  public?: boolean;

  /** Name of the strategy registered in AuthStrategyRegistry. */
  strategy?: string;

  /** Allowed user roles; user must have at least one. */
  roles?: string[];

  /** Named authorization policies; every policy must grant access. */
  policies?: string[];
};


/**
 * ## RouteMeta
 *
 * Static metadata describing a single route produced by `route(meta)(handler)`.
 * This metadata is read by `RuntimeRouter` at application bootstrap and
 * becomes part of the compiled routing table.
 *
 * Fields:
 * - `method` — HTTP method (GET/POST/PUT/DELETE/...)  
 * - `path` — route path template (`/users/:id`)  
 * - `auth` — optional authentication & authorization constraints
 * - `schema` — optional validation schema (params/query/body)  
 *
 * Notes:
 * - This metadata is **pure** and never mutated at runtime.
 * - Routers do not execute any logic here — they simply store and return it.
 * - Orchestrator uses `schema` for validation and `auth` for authentication.
 */
export type RouteMeta<P extends string = string> = {
  method: Method;
  path: P;
  auth?: RouteAuth;
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
