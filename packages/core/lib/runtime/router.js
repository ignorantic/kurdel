import { ROUTE_META } from '../api/routing.js';
function compilePath(path) {
    const keys = [];
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
export class RouterImpl {
    constructor() {
        this.entries = [];
        this.middlewares = [];
    }
    init({ resolver, controllerConfigs, middlewares }) {
        this.middlewares = [...middlewares];
        controllerConfigs.forEach((cfg) => {
            const instance = resolver.get(cfg.use);
            cfg.middlewares?.forEach((mw) => instance.use(mw));
            this.useController(instance, cfg.prefix ?? '');
        });
    }
    useController(controller, prefix) {
        for (const [action, handler] of Object.entries(controller.routes)) {
            const meta = handler[ROUTE_META];
            if (!meta)
                continue;
            const fullPath = prefix + meta.path;
            this.add(meta.method, fullPath, controller, action);
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
                req.__params = params;
                entry.controller.execute(req, res, entry.action, this.middlewares);
            };
        }
        return null;
    }
}
//# sourceMappingURL=router.js.map