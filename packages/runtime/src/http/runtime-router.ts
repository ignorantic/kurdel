import type { Container } from '@kurdel/ioc';
import { ROUTE_META } from '@kurdel/core/http';
import type {
  Method,
  RouteMeta,
  ControllerConfig,
  ControllerResolver,
  Router,
  Middleware,
  Controller,
} from '@kurdel/core/http';

/**
 * Represents a single static route entry in the compiled routing table.
 *
 * @internal
 */
type Entry = {
  /** HTTP method of the route (GET, POST, etc.) */
  method: Method;
  /** Original declared path (e.g. `/users/:id`) */
  path: string;
  /** Compiled regex for fast matching */
  regex: RegExp;
  /** Extracted param keys from path (`['id']`) */
  keys: string[];
  /** Controller IoC token */
  token: ControllerConfig['use'];
  /** Action (controller method) name */
  action: string;
  /** Middlewares declared at controller level */
  controllerMiddlewares: Middleware[];
};

/**
 * Compiles a route path (with `:params`) into a RegExp matcher.
 *
 * @param path - Route path string (e.g. `/users/:id`)
 * @returns Regex and ordered param keys.
 *
 * @example
 * ```ts
 * compilePath('/users/:id')
 * // → { regex: /^\/users\/([^/]+)\/?$/, keys: ['id'] }
 * ```
 */
function compilePath(path: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];

  if (!path || path === '/') {
    return { regex: /^\/?$/, keys };
  }

  const pattern = path
    .split('/')
    .filter(Boolean)
    .map(segment => {
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment;
    })
    .join('/');

  return { regex: new RegExp(`^/${pattern}/?$`), keys };
}

/**
 * ## RuntimeRouter
 *
 * The **central routing registry** used by Kurdel at runtime.
 *
 * ### Responsibilities
 * - Compiles controller route metadata (`RouteMeta`) into an internal lookup table.
 * - Resolves incoming `(method, url)` pairs to the correct controller action.
 * - Produces a `RouteMatch` object that the `RuntimeRequestOrchestrator` executes.
 *
 * ### Design Notes
 * - **Purely declarative:** contains no rendering or middleware execution logic.
 * - **Static:** built once at bootstrap; no dynamic route insertion.
 * - **Fast:** uses precompiled RegExp matchers for O(1) lookup in small tables.
 *
 * @example
 * ```ts
 * const router = new RuntimeRouter();
 * router.init(resolver, controllers);
 * const match = router.resolve('GET', '/users/42', ioc);
 * if (match) execute(match.controller, match.action);
 * ```
 */
export class RuntimeRouter implements Router {
  /** All registered route entries (compiled at bootstrap). */
  private entries: Entry[] = [];

  /** Controller resolver injected at initialization. */
  private resolver!: ControllerResolver;

  /**
   * Initializes router from controller metadata.
   *
   * @param resolver - Controller resolver used for IoC resolution.
   * @param controllerConfigs - List of controller declarations from user modules.
   *
   * @remarks
   * Should be called exactly once during application bootstrap.
   */
  public init(resolver: ControllerResolver, controllerConfigs: ControllerConfig[]): void {
    this.resolver = resolver;

    controllerConfigs.forEach(cfg => {
      const tempInstance = resolver.resolve(cfg.use);
      const prefix = cfg.prefix ?? '';
      const controllerMws = cfg.middlewares ?? [];
      this.registerController(tempInstance, prefix, cfg.use, controllerMws);
    });
  }

  /**
   * Resolves a controller action for a given request.
   *
   * @param method - HTTP method (`GET`, `POST`, etc.)
   * @param url - Request URL (may include query string)
   * @param scope - Per-request IoC container
   *
   * @returns Matched route info (`RouteMatch`) or `null` if no route matches.
   *
   * @remarks
   * Does **not** execute any middleware or rendering.
   * Only performs static lookup and controller resolution.
   */
  public resolve(method: Method, url: string, scope: Container) {
    const pathname = (url ?? '/').split('?')[0].replace(/\\/g, '/');

    for (const entry of this.entries) {
      if (entry.method !== method) continue;

      const match = entry.regex.exec(pathname);
      if (!match) continue;

      const params = Object.fromEntries(entry.keys.map((key, i) => [key, match[i + 1]]));

      const controller = this.resolver.resolve<Controller<any>>(entry.token, scope);

      return {
        controller,
        method,
        action: entry.action,
        path: entry.path,
        params,
        middlewares: entry.controllerMiddlewares,
      };
    }

    return null;
  }

  /**
   * Registers all routes declared within a controller.
   *
   * @param controllerInstance - A temporary instance used to inspect `routes`.
   * @param prefix - Optional URL prefix applied to all controller routes.
   * @param token - Controller IoC token.
   * @param controllerMiddlewares - Middlewares attached at controller level.
   */
  private registerController<T extends Record<string, any>>(
    controllerInstance: Controller<T>,
    prefix: string,
    token: ControllerConfig['use'],
    controllerMiddlewares: Middleware[]
  ) {
    for (const [action, handler] of Object.entries(controllerInstance.routes)) {
      const meta: RouteMeta | undefined = (handler as any)[ROUTE_META];
      if (!meta) continue;

      const fullPath = prefix + meta.path;
      this.add(meta.method, fullPath, token, action, controllerMiddlewares);
    }
  }

  /**
   * Adds a single route entry to the routing table.
   *
   * @param method - HTTP method
   * @param path - Route path pattern
   * @param token - Controller IoC token
   * @param action - Controller method name
   * @param controllerMiddlewares - Middlewares declared at controller level
   *
   * @internal
   */
  private add(
    method: Method,
    path: string,
    token: ControllerConfig['use'],
    action: string,
    controllerMiddlewares: Middleware[]
  ) {
    if (this.entries.some(e => e.method === method && e.path === path)) {
      console.warn(`[Router] Duplicate route ignored: ${method} ${path}`);
      return;
    }

    const { regex, keys } = compilePath(path);
    this.entries.push({ method, path, regex, keys, token, action, controllerMiddlewares });
  }
}
