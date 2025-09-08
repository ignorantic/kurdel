import type { Newable } from '@kurdel/common';
import { IncomingMessage, ServerResponse } from 'http';
import { Controller } from './controller.js';
import { ROUTE_META, type RouteMeta } from './routing.js';
import type { Method, ControllerResolver } from './types.js';

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
  const pattern = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment;
    })
    .join('/');
  return { regex: new RegExp(`^${pattern}$`), keys };
}

export class Router {
  private entries: Entry[] = [];

  constructor(resolver: ControllerResolver, controllers: Newable<Controller<any>>[]) {
    controllers.forEach((ControllerClass) => {
      const instance = resolver.get<Controller<any>>(ControllerClass);
      this.useController(instance);
    });
  }

  private useController<T>(controller: Controller<T>) {
    for (const [action, handler] of Object.entries(controller.routes)) {
      const meta: RouteMeta | undefined = (handler as any)[ROUTE_META];
      if (!meta) continue;
      this.add(meta.method, meta.path, controller, action);
    }
  }

  private add<T>(method: Method, path: string, controller: Controller<T>, action: string) {
    const { regex, keys } = compilePath(path);
    this.entries.push({ method, path, regex, keys, controller, action });
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

      return (req: IncomingMessage, res: ServerResponse) => {
        // enrich ctx.params via monkey-patch
        (req as any).__params = params;
        entry.controller.execute(req, res, entry.action);
      };
    }

    return null;
  }
}
