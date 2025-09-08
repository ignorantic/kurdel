import { ROUTE_META } from './routing.js';
function compilePath(path) {
    const keys = [];
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
    constructor(resolver, controllers, registry) {
        this.entries = [];
        this.middlewares = [];
        this.middlewares = registry.all();
        controllers.forEach((ControllerClass) => {
            const instance = resolver.get(ControllerClass);
            registry.for(ControllerClass).forEach((mw) => instance.use(mw));
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
        const { regex, keys } = compilePath(path);
        this.entries.push({ method, path, regex, keys, controller, action });
    }
    use(mw) {
        this.middlewares.push(mw);
    }
    resolve(method, url) {
        const safe = (url || '/').replace(/\\/g, '/');
        const pathname = new URL(safe, 'http://internal').pathname;
        for (const entry of this.entries) {
            if (entry.method !== method)
                continue;
            const match = entry.regex.exec(pathname);
            if (!match)
                continue;
            const params = {};
            entry.keys.forEach((key, i) => {
                params[key] = match[i + 1];
            });
            return (req, res) => {
                // enrich ctx.params via monkey-patch
                req.__params = params;
                entry.controller.execute(req, res, entry.action, this.middlewares);
            };
        }
        return null;
    }
}
//# sourceMappingURL=router.js.map