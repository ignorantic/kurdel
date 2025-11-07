import type { Container } from '@kurdel/ioc';
import type {
  Method,
  ControllerConfig,
  ControllerResolver,
  RouteMatch,
} from 'src/http/index.js';

/**
 * A minimal HTTP router contract.
 *
 * Responsibilities:
 * - Register routes at bootstrap (`init`)
 * - Resolve a request (method + path) to an executable handler
 * - Leave actual execution (middlewares, controller action, rendering)
 *   to higher orchestration layers.
 */
export interface Router {
  /**
   * Initializes the routing table and prepares route lookup.
   * Called exactly once during application bootstrap.
   */
  init(resolver: ControllerResolver, controllerConfigs: ControllerConfig[]): void;

  /**
   * Attempts to resolve a route for the given HTTP method and URL.
   *
   * Returns a {@link RouteMatch} describing which controller/action to execute,
   * or `null` if no route matches.
   *
   * The returned object is later executed by RuntimeRequestOrchestrator.
   */
  resolve(
    method: Method,
    url: string,
    scope: Container
  ): RouteMatch | null;
}
