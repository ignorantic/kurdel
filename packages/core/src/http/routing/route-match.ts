import type {
  Controller,
  Method,
  RouteAuth,
  RouteSchema,
} from 'src/http/index.js';

/**
 * ## RouteMatch
 *
 * The normalized result of router resolution.
 * Returned by `Router.resolve()` and consumed by the orchestrator
 * to drive validation, authentication, middleware selection,
 * and controller execution.
 *
 * Fields:
 *   - controller → DI-resolved controller instance for this request
 *   - method     → HTTP method used for routing
 *   - action     → name of the controller method to invoke
 *   - path       → normalized route path (prefix + declared path)
 *   - params     → extracted path parameters
 *   - auth       → optional per-route authentication/authorization rules
 *   - schema     → optional validation schema for params/query/body
 */
export interface RouteMatch {
  controller: Controller<any>;
  method: Method;
  action: string;
  path: string;
  params: Record<string, string>;
  auth?: RouteAuth;
  schema?: RouteSchema;
}
