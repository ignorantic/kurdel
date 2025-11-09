import { ROUTE_META } from '@kurdel/core/http';
import type { Container } from '@kurdel/ioc';
import type {
  Method,
  RouteMeta,
  ControllerConfig,
  ControllerResolver,
  Router,
  Controller,
  Middleware,
  RouteHandler,
} from '@kurdel/core/http';

/**
 * ## RuntimeRouter (symbol-based metadata)
 *
 * Builds the route table by reading `ROUTE_META` metadata
 * attached to handler functions produced by `route(meta)(fn)`.
 *
 * This matches Kurdel's current controller design, where
 * controllers declare `routes` as:
 * ```ts
 * readonly routes = {
 *   getAll: route({ method: 'GET', path: '/' })(this.getAll),
 *   getOne: route({ method: 'GET', path: '/:id' })(this.getOne),
 * };
 * ```
 */
export class RuntimeRouter implements Router {
  /** Internal table of compiled routes. */
  private entries: {
    method: Method;
    path: string;
    regex: RegExp;
    keys: string[];
    token: ControllerConfig['use'];
    action: string;
  }[] = [];

  /** Resolver for controller instances. */
  private resolver!: ControllerResolver;

  /**
   * Initializes router by resolving controllers and reading
   * their declared `routes` field.
   */
  public init(resolver: ControllerResolver, controllerConfigs: ControllerConfig[]): void {
    this.resolver = resolver;

    for (const cfg of controllerConfigs) {
      const prefix = cfg.prefix ?? '';

      // Create a real controller instance to access `routes`
      const instance = resolver.resolve(cfg.use);
      const routes = instance.routes as Record<string, RouteHandler>;

      for (const [action, handler] of Object.entries(routes)) {
        const meta: RouteMeta | undefined = (handler as any)[ROUTE_META];
        if (!meta) continue;

        const fullPath = prefix + meta.path;
        this.add(meta.method, fullPath, cfg.use, action);
      }
    }

    if (process.env.DEBUG_ROUTES) {
      console.log(
        '[router] Registered:',
        this.entries.map(e => `${e.method} ${e.path}`)
      );
    }
  }

  /**
   * Resolves a matching controller + action for a request.
   */
  public resolve(method: Method, url: string, scope: Container) {
    const pathname = (url ?? '/').split('?')[0].replace(/\\/g, '/');

    for (const entry of this.entries) {
      if (entry.method !== method) continue;

      const match = entry.regex.exec(pathname);
      if (!match) continue;

      const params = Object.fromEntries(entry.keys.map((k, i) => [k, match[i + 1]]));
      const controller = this.resolver.resolve<Controller<any>>(entry.token, scope);

      return {
        controller,
        method,
        action: entry.action,
        path: entry.path,
        params,
        middlewares: [] as Middleware[], // kept for interface compatibility
      };
    }

    return null;
  }

  /**
   * Adds a single route entry to the compiled table.
   */
  private add(method: Method, path: string, token: ControllerConfig['use'], action: string) {
    const keys: string[] = [];
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

    const regex = new RegExp(`^/${pattern}/?$`);
    this.entries.push({ method, path, regex, keys, token, action });
  }
}
