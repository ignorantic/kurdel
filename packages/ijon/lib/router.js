import { parse } from 'url';
export class Router {
    routes;
    constructor() {
        this.routes = [];
    }
    addRoute(method, path, controller, actionName) {
        const handler = this.controllerAction(controller, actionName);
        this.routes.push({ method, path, handler });
    }
    get(path, controller, actionName) {
        this.addRoute('GET', path, controller, actionName);
    }
    post(path, controller, actionName) {
        this.addRoute('POST', path, controller, actionName);
    }
    resolve(method, url) {
        const { pathname } = parse(url, true);
        const route = this.routes.find(route => route.method === method && route.path === pathname);
        return route ? route.handler : null;
    }
    controllerAction(controller, actionName) {
        return (req, res) => {
            controller.execute(req, res, actionName);
        };
    }
}
