import type { Newable } from '@kurdel/common';
import { IncomingMessage, ServerResponse } from 'http';
import { Controller } from './controller.js';
import { ROUTE_META, type RouteMeta } from './routing.js';
import type { Method } from './types.js';

export interface ControllerResolver {
  get<T>(cls: Newable<T>): T;
}

type Entry = {
  method: Method;
  path: string;
  controller: Controller<any>;
  action: string;
};

export class Router {
  private entries: Entry[] = [];

  constructor(resolver: ControllerResolver, controllers: Newable<Controller<any>>[]) {
    controllers.forEach((ControllerClass) => {
      const instance = resolver.get(ControllerClass);
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
    this.entries.push({ method, path, controller, action });
  }

  resolve(method: Method, url: string) {
    const safe = (url || '/').replace(/\\/g, '/');
    const pathname = new URL(safe, 'http://internal').pathname;

    const found = this.entries.find(
      (e) => e.method === method && e.path === pathname
    );
    if (!found) return null;

    return (req: IncomingMessage, res: ServerResponse) => {
      found.controller.execute(req, res, found.action);
    };
  }
}
