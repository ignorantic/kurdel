import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { Controller } from './controller.js';
import { Method, Route } from './types.js';

export class Router {
  private routes: Route[];

  constructor(...controllers: Controller<unknown>[]) {
    this.routes = [];
    controllers.forEach(controller => this.useController(controller));
  }

  useController<T>(controller: Controller<T>) {
    controller.routes.forEach((item) => {
      this.addRoute<T>(item.method, item.path, controller, item.action as string)
    })
  }

  private addRoute<T>(method: Method, path: string, controller: Controller<T>, action: string) {
    const handler = this.controllerAction<T>(controller, action)
    this.routes.push({ method, path, handler });
  }

  resolve(method: Method, url: string) {
    const { pathname } = parse(url, true);
    const route = this.routes.find(route => route.method === method && route.path === pathname);
    return route ? route.handler : null;
  }

  controllerAction<T>(controller: Controller<T>, action: string) {
    return (req: IncomingMessage, res: ServerResponse) => {
      controller.execute(req, res, action);
    };
  }
}

