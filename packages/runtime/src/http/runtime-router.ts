import type { Container } from '@kurdel/ioc';
import type {
  Method,
  RouteMeta,
  ControllerConfig,
  ControllerResolver,
  Router,
  Controller,
  RouteSchema,
  RouteMatch,
} from '@kurdel/core/http';
import { ROUTE_META } from '@kurdel/core/http';

/**
 * Internal compiled route entry.
 */
interface Entry {
  method: Method;
  path: string;
  regex: RegExp;
  keys: string[];
  token: ControllerConfig['use'];
  action: string;
  schema?: RouteSchema;
}

/**
 * Joins two path segments safely, preventing `//` occurrences.
 */
function joinPaths(a: string, b: string): string {
  return `${a.replace(/\/+$/, '')}/${b.replace(/^\/+/, '')}`;
}

/**
 * Extracts path keys and compiles a regex matcher.
 */
function compilePath(path: string): { regex: RegExp; keys: string[] } {
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

  const regex = pattern ? new RegExp(`^/${pattern}/?$`) : /^\/$/;

  return { regex, keys };
}

/**
 * ## RuntimeRouter
 *
 * Responsible for:
 * - extracting metadata from controller `routes`
 * - compiling patterns into a fast lookup table
 * - performing deterministic route matching at runtime
 *
 * Initialization stages:
 *   1️⃣ iterate controller configs
 *   2️⃣ instantiate controller *only to read routes*
 *   3️⃣ extract `ROUTE_META` from handlers
 *   4️⃣ normalize `prefix + path`
 *   5️⃣ compile regex + param keys
 *   6️⃣ store immutable route entries
 */
export class RuntimeRouter implements Router {
  /** Immutable table of compiled routes. */
  private readonly entries: Entry[] = [];

  /** Controller instance resolver (DI-based). */
  private resolver!: ControllerResolver;

  /**
   * Builds the route table by reading controller metadata.
   */
  public init(resolver: ControllerResolver, controllerConfigs: ControllerConfig[]): void {
    this.resolver = resolver;

    for (const { use: ControllerClass, prefix = '' } of controllerConfigs) {
      /**
       * We instantiate the controller *only* to read its static `routes` definition.
       *
       * This instance:
       *   - is not created by DI
       *   - receives no real dependencies (`{}` is enough)
       *   - is never used to execute actions
       *
       * During request handling, controllers are instantiated per-scope
       * via ControllerResolver — this initialization step only extracts metadata.
       */
      const { routes } = new ControllerClass({} as any);

      for (const [action, handler] of Object.entries(routes)) {
        const meta: RouteMeta | undefined = (handler as any)[ROUTE_META];
        if (!meta) continue;

        const fullPath = joinPaths(prefix, meta.path);
        const { method, schema } = meta;

        this.addEntry(method, fullPath, ControllerClass, action, schema);
      }
    }

    // Optional debug output
    if (process.env.DEBUG_ROUTES) {
      console.log(
        '[router] Registered:',
        this.entries.map(e => `${e.method} ${e.path}`)
      );
    }
  }

  /**
   * Matches an incoming HTTP request to a controller/action.
   */
  public resolve(method: Method, url: string, scope: Container): RouteMatch | null {
    const pathname = (url ?? '/').split('?')[0].replace(/\\/g, '/');

    for (const entry of this.entries) {
      if (entry.method !== method) continue;

      const match = entry.regex.exec(pathname);
      if (!match) continue;

      const params: Record<string, string> = {};
      entry.keys.forEach((key, i) => {
        params[key] = match[i + 1];
      });

      const controller = this.resolver.resolve<Controller<any>>(entry.token, scope);

      return {
        controller,
        method,
        action: entry.action,
        path: entry.path,
        params,
        schema: entry.schema,
      };
    }

    return null;
  }

  /**
   * Adds a compiled route entry into the lookup table.
   */
  private addEntry(
    method: Method,
    path: string,
    token: ControllerConfig['use'],
    action: string,
    schema?: RouteSchema
  ): void {
    const { regex, keys } = compilePath(path);

    this.entries.push({
      method,
      path,
      regex,
      keys,
      token,
      action,
      schema,
    });
  }
}
