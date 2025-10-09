import type { Container } from '@kurdel/ioc';

import type {
  Method,
  HttpRequest,
  HttpResponse,
  RouteMeta,
  ControllerConfig,
  ControllerResolver,
  Router,
  Middleware,
 Controller} from '@kurdel/core/http';
import { ROUTE_META } from '@kurdel/core/http';

type Entry = {
  method: Method;
  path: string;
  regex: RegExp;
  keys: string[];
  // Store the controller token/ctor instead of the instance to enable request-scoped resolution.
  token: ControllerConfig['use'];
  action: string;
  // Per-controller middlewares from ControllerConfig; applied on the per-request instance before execute.
  controllerMiddlewares: Middleware[];
};

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
  // Note: allow optional trailing slash for convenience.
  return { regex: new RegExp(`^/${pattern}/?$`), keys };
}

interface RouterDeps {
  resolver: ControllerResolver;
  controllerConfigs: ControllerConfig[];
  middlewares: Middleware[];
}

export class RuntimeRouter implements Router {
  private entries: Entry[] = [];
  private middlewares: Middleware[] = [];
  private resolver!: ControllerResolver;

  public init({ resolver, controllerConfigs, middlewares }: RouterDeps): void {
    // Save the resolver for request-time scope resolution.
    this.resolver = resolver;

    // Keep global middlewares as before (order preserved).
    this.middlewares = [...middlewares];

    // Build entries by inspecting controller routes, but do NOT keep the instance.
    controllerConfigs.forEach(cfg => {
      // Temporary instance from root (or wherever ControllerResolver.get resolves):
      // used only to read `routes` and their RouteMeta at bootstrap.
      const tempInstance = resolver.get(cfg.use);

      // Apply config-level middlewares to entries, not to the temp instance.
      // (We will apply them to the per-request instance at dispatch.)
      const prefix = cfg.prefix ?? '';
      const controllerMws = cfg.middlewares ?? [];

      this.useController(tempInstance, prefix, cfg.use, controllerMws);
    });
  }

  public use(mw: Middleware) {
    this.middlewares.push(mw);
  }

  /**
   * Resolve to a handler that now accepts (req, res, scope).
   * The scope is the per-request container created by the server adapter.
   */
  public resolve(method: Method, url: string, scope: Container) {
    const safe = (url || '/').replace(/\\/g, '/');
    const pathname = new URL(safe, 'http://internal').pathname;

    for (const entry of this.entries) {
      if (entry.method !== method) continue;
      const match = entry.regex.exec(pathname);
      if (!match) continue;

      // Extract ":param" values by index
      const params: Record<string, string> = {};
      entry.keys.forEach((key, i) => {
        params[key] = match[i + 1];
      });

      // Return a dispatch function that receives the request scope explicitly.
      return async (req: HttpRequest, res: HttpResponse) => {
        // Expose params for Controller.execute() to pick up.
        (req as any).__params = params;

        // Resolve a fresh controller instance from the request scope (fallback handled inside resolver).
        const controller = this.resolver.resolve<Controller<any>>(entry.token as any, scope);

        // Apply controller-level middlewares from config to THIS instance.
        // This is safe because the instance is per-request (no duplication across requests).
        for (const mw of entry.controllerMiddlewares) controller.use(mw);

        // Execute action with global middlewares preserved.
        await controller.execute(req as any, res as any, entry.action, this.middlewares);
      };
    }

    return null;
  }

  /**
   * Read RouteMeta from the controller's `routes` and register entries.
   * Note: we pass a token (ctor) to entries for request-time resolution.
   */
  private useController<T>(
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

  private add(
    method: Method,
    path: string,
    token: ControllerConfig['use'],
    action: string,
    controllerMiddlewares: Middleware[]
  ) {
    const { regex, keys } = compilePath(path);
    this.entries.push({ method, path, regex, keys, token, action, controllerMiddlewares });
  }
}
