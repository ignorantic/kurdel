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
  RouteSchema,
} from '@kurdel/core/http';

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

  /** Optional validation schema for params/query/body */
  schema?: RouteSchema;
};


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
  private entries: Entry[] = [];

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

        const schema = meta.schema as RouteSchema | undefined;

        this.add(meta.method, fullPath, cfg.use, action, schema);
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
        schema: entry.schema,
        middlewares: [] as Middleware[],
      };
    }

    return null;
  }

  /**
   * Adds a single route entry to the compiled table.
   */
  private add(method: Method, path: string, token: ControllerConfig['use'], action: string, schema?: RouteSchema) {
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
    this.entries.push({ method, path, regex, keys, token, action, schema });
  }
}
