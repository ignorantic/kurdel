import { parse } from 'url';
export class Router {
    routes;
    constructor(...controllers) {
        this.routes = [];
        controllers.forEach(controller => this.useController(controller));
    }
    useController(controller) {
        controller.routes.forEach((item) => {
            this.addRoute(item.method, item.path, controller, item.action);
        });
    }
    addRoute(method, path, controller, action) {
        const handler = this.controllerAction(controller, action);
        this.routes.push({ method, path, handler });
    }
    resolve(method, url) {
        const { pathname } = parse(url, true);
        const route = this.routes.find(route => route.method === method && route.path === pathname);
        return route ? route.handler : null;
    }
    controllerAction(controller, action) {
        return (req, res) => {
            controller.execute(req, res, action);
        };
    }
}
