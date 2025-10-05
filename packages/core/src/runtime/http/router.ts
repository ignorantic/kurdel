import type {
  Method,
  Middleware,
  HttpRequest,
  HttpResponse,
} from 'src/api/http/types.js';
import { ControllerConfig, Router, ControllerResolver } from 'src/api/http/interfaces.js';
import { Controller } from 'src/api/http/controller.js';
import { ROUTE_META, type RouteMeta } from 'src/api/http/routing.js';

type Entry = {
  method: Method;
  path: string;
  regex: RegExp;
  keys: string[];
  controller: Controller<any>;
  action: string;
};

function compilePath(path: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];

  if (!path || path === '/') {
    return { regex: /^\/?$/, keys };
  }

  const pattern = path
    .split('/')
    .filter(Boolean)
    .map((segment) => {
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
  middlewares: Middleware[];
}

export class RouterImpl implements Router {
  private entries: Entry[] = [];
  private middlewares: Middleware[] = [];

  init({ resolver, controllerConfigs, middlewares }: RouterDeps): void {
    this.middlewares = [...middlewares];

    controllerConfigs.forEach((cfg) => {
      const instance = resolver.get(cfg.use);
      cfg.middlewares?.forEach((mw) => instance.use(mw));
      this.useController(instance, cfg.prefix ?? '');
    });
  }

  private useController<T>(controller: Controller<T>, prefix: string) {
    for (const [action, handler] of Object.entries(controller.routes)) {
      const meta: RouteMeta | undefined = (handler as any)[ROUTE_META];
      if (!meta) continue;

      const fullPath = prefix + meta.path;
      this.add(meta.method, fullPath, controller, action);
    }
  }

  private add<T>(method: Method, path: string, controller: Controller<T>, action: string) {
    const { regex, keys } = compilePath(path);
    this.entries.push({ method, path, regex, keys, controller, action });
  }

  use(mw: Middleware) {
    this.middlewares.push(mw);
  }

  resolve(method: Method, url: string) {
    const safe = (url || '/').replace(/\\/g, '/');
    const pathname = new URL(safe, 'http://internal').pathname;

    for (const entry of this.entries) {
      if (entry.method !== method) continue;
      const match = entry.regex.exec(pathname);
      if (!match) continue;

      const params: Record<string, string> = {};
      entry.keys.forEach((key, i) => {
        params[key] = match[i + 1];
      });

      return (req: HttpRequest, res: HttpResponse) => {
        (req as any).__params = params;
        entry.controller.execute(req as any, res as any, entry.action, this.middlewares);
      };
    }

    return null;
  }
}
