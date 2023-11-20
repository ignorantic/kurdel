import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { Controller } from './controller.js';

export type Method = 'GET' | 'POST';

export type Route = { method: Method, path: string, handler: Function };

export class Router {
  private routes: Route[];

  constructor() {
    this.routes = [];
  }

  addRoute(method: Method, path: string, controller: Controller, actionName: string) {
    const handler = this.controllerAction(controller, actionName)
    this.routes.push({ method, path, handler });
  }

  get(path: string, controller: Controller, actionName: string) {
    this.addRoute('GET', path, controller, actionName);
  }

  post(path: string, controller: Controller, actionName: string) {
    this.addRoute('POST', path, controller, actionName);
  }

  resolve(method: Method, url: string) {
    const { pathname } = parse(url, true);
    const route = this.routes.find(route => route.method === method && route.path === pathname);
    return route ? route.handler : null;
  }

  controllerAction(controller: Controller, actionName: string) {
    return (req: IncomingMessage, res: ServerResponse) => {
      controller.execute(req, res, actionName);
    };
  }
}

