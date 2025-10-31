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
import { RuntimeRequestOrchestrator } from 'src/http/runtime-request-orchestrator.js';

type Entry = {
  method: Method;
  path: string;
  regex: RegExp;
  keys: string[];
  token: ControllerConfig['use'];
  action: string;
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
  return { regex: new RegExp(`^/${pattern}/?$`), keys };
}

interface RouterDeps {
  resolver: ControllerResolver;
  controllerConfigs: ControllerConfig[];
  middlewares?: Middleware[];
}

/**
 * RuntimeRouter is responsible for:
 * - Matching incoming requests to controller actions
 * - Executing pre-routing middleware (e.g. static, CORS)
 * - Delegating matched routes to RuntimeRequestOrchestrator
 */
export class RuntimeRouter implements Router {
  private entries: Entry[] = [];

  private resolver!: ControllerResolver;

  public middlewares: Middleware[] = [];

  public init({ resolver, controllerConfigs, middlewares = [] }: RouterDeps): void {
    this.resolver = resolver;
    this.middlewares.push(...middlewares);

    controllerConfigs.forEach(cfg => {
      const tempInstance = resolver.resolve(cfg.use);
      const prefix = cfg.prefix ?? '';
      const controllerMws = cfg.middlewares ?? [];
      this.registerController(tempInstance, prefix, cfg.use, controllerMws);
    });
  }

  /** Adds a global middleware executed before routing. */
  public use(mw: Middleware) {
    this.middlewares.push(mw);
  }

  /**
   * Resolves a controller action into a request handler.
   * Always returns a function — even for unmatched routes.
   */
  public resolve(method: Method, url: string, scope: Container) {
    const pathname = (url ?? '/').split('?')[0].replace(/\\/g, '/');

    const orchestrator = new RuntimeRequestOrchestrator(this.middlewares);

    for (const entry of this.entries) {
      if (entry.method !== method) continue;

      const match = entry.regex.exec(pathname);
      if (!match) continue;

      const params = Object.fromEntries(entry.keys.map((key, i) => [key, match[i + 1]]));

      // ✅ Route match → build request handler
      return async (req: HttpRequest, res: HttpResponse) => {
        (req as any).__params = params;

        const controller = this.resolver.resolve<Controller<any>>(entry.token, scope);
        for (const mw of entry.controllerMiddlewares) controller.use(mw);

        await orchestrator.execute(req, res, controller, entry.action);
      };
    }

    // 🧩 No matching route → delegate to orchestrator (middleware-only + 404)
    return async (req: HttpRequest, res: HttpResponse) => {
      await orchestrator.execute(req, res);
    };
  }

  /**
   * Registers all controller routes (based on RouteMeta).
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
