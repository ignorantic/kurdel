import { ROUTE_META } from './routing.js';
export class Router {
    constructor(resolver, controllers) {
        this.entries = [];
        controllers.forEach((ControllerClass) => {
            const instance = resolver.get(ControllerClass);
            this.useController(instance);
        });
    }
    useController(controller) {
        for (const [action, handler] of Object.entries(controller.routes)) {
            const meta = handler[ROUTE_META];
            if (!meta)
                continue;
            this.add(meta.method, meta.path, controller, action);
        }
    }
    add(method, path, controller, action) {
        this.entries.push({ method, path, controller, action });
    }
    resolve(method, url) {
        const safe = (url || '/').replace(/\\/g, '/');
        const pathname = new URL(safe, 'http://internal').pathname;
        const found = this.entries.find((e) => e.method === method && e.path === pathname);
        if (!found)
            return null;
        return (req, res) => {
            found.controller.execute(req, res, found.action);
        };
    }
}
//# sourceMappingURL=router.js.map