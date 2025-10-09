import { ROUTE_META } from '@kurdel/core/http';
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
    // Note: allow optional trailing slash for convenience.
    return { regex: new RegExp(`^/${pattern}/?$`), keys };
}
export class RuntimeRouter {
    constructor() {
        this.entries = [];
        this.middlewares = [];
    }
    init({ resolver, controllerConfigs, middlewares }) {
        // Save the resolver for request-time scope resolution.
        this.resolver = resolver;
        // Keep global middlewares as before (order preserved).
        this.middlewares = [...middlewares];
        // Build entries by inspecting controller routes, but do NOT keep the instance.
        controllerConfigs.forEach((cfg) => {
            // Temporary instance from root (or wherever ControllerResolver.get resolves):
            // used only to read `routes` and their RouteMeta at bootstrap.
            const tempInstance = resolver.get(cfg.use);
            // Apply config-level middlewares to entries, not to the temp instance.
            // (We will apply them to the per-request instance at dispatch.)
            const prefix = cfg.prefix ?? '';
            const controllerMws = cfg.middlewares ?? [];
            this.useController(tempInstance, prefix, cfg.use, controllerMws);
        });
    }
    use(mw) {
        this.middlewares.push(mw);
    }
    /**
     * Resolve to a handler that now accepts (req, res, scope).
     * The scope is the per-request container created by the server adapter.
     */
    resolve(method, url, scope) {
        const safe = (url || '/').replace(/\\/g, '/');
        const pathname = new URL(safe, 'http://internal').pathname;
        for (const entry of this.entries) {
            if (entry.method !== method)
                continue;
            const match = entry.regex.exec(pathname);
            if (!match)
                continue;
            // Extract ":param" values by index
            const params = {};
            entry.keys.forEach((key, i) => {
                params[key] = match[i + 1];
            });
            // Return a dispatch function that receives the request scope explicitly.
            return async (req, res) => {
                // Expose params for Controller.execute() to pick up.
                req.__params = params;
                // Resolve a fresh controller instance from the request scope (fallback handled inside resolver).
                const controller = this.resolver.resolve(entry.token, scope);
                // Apply controller-level middlewares from config to THIS instance.
                // This is safe because the instance is per-request (no duplication across requests).
                for (const mw of entry.controllerMiddlewares)
                    controller.use(mw);
                // Execute action with global middlewares preserved.
                await controller.execute(req, res, entry.action, this.middlewares);
            };
        }
        return null;
    }
    /**
     * Read RouteMeta from the controller's `routes` and register entries.
     * Note: we pass a token (ctor) to entries for request-time resolution.
     */
    useController(controllerInstance, prefix, token, controllerMiddlewares) {
        for (const [action, handler] of Object.entries(controllerInstance.routes)) {
            const meta = handler[ROUTE_META];
            if (!meta)
                continue;
            const fullPath = prefix + meta.path;
            this.add(meta.method, fullPath, token, action, controllerMiddlewares);
        }
    }
    add(method, path, token, action, controllerMiddlewares) {
        const { regex, keys } = compilePath(path);
        this.entries.push({ method, path, regex, keys, token, action, controllerMiddlewares });
    }
}
//# sourceMappingURL=runtime-router.js.map