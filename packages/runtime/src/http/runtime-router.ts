import type { HttpRequest, HttpResponse } from '@kurdel/common';
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

import { RuntimeControllerExecutor } from 'src/http/runtime-controller-executor.js';

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
  private resolver!: ControllerResolver;

  public middlewares: Middleware[] = [];

  public init({ resolver, controllerConfigs, middlewares }: RouterDeps): void {
    // Save the resolver for request-time scope resolution.
    this.resolver = resolver;

    // Save global middlewares for use in RuntimeControllerExecutor
    this.middlewares = middlewares ?? [];

    // Build entries by inspecting controller routes, but do NOT keep the instance.
    controllerConfigs.forEach(cfg => {
      // Temporary instance from root (or wherever ControllerResolver.get resolves):
      // used only to read `routes` and their RouteMeta at bootstrap.
      const tempInstance = resolver.resolve(cfg.use);

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
    const pathname = (url ?? '/').split('?')[0].replace(/\\/g, '/');

    for (const entry of this.entries) {
      if (entry.method !== method) continue;

      const match = entry.regex.exec(pathname);
      if (!match) continue;

      const params = Object.fromEntries(entry.keys.map((key, i) => [key, match[i + 1]]));

      return async (req: HttpRequest, res: HttpResponse) => {
        (req as any).__params = params;

        const controller = this.resolver.resolve<Controller<any>>(entry.token, scope);

        for (const mw of entry.controllerMiddlewares) controller.use(mw);

        const executor = new RuntimeControllerExecutor(this.middlewares);
        await executor.execute(controller, req as any, res as any, entry.action);
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
