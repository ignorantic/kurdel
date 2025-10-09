import { TOKENS } from '@kurdel/core/app';
import { NativeHttpServerAdapter } from '../http/adapters/native-http-server-adapter.js';
/**
 * ServerModule: wires the HTTP ServerAdapter to the Router.
 *
 * - Provides a singleton ServerAdapter implementation
 * - Injects the root Container and the Router into the adapter
 * - No global state; request-scope is created inside the adapter per request-scope
 */
export class ServerModule {
    constructor(config) {
        this.imports = {
            router: TOKENS.Router,
            registry: TOKENS.MiddlewareRegistry,
            controllerConfigs: TOKENS.ControllerConfigs,
            controllerResolver: TOKENS.ControllerResolver,
        };
        this.exports = { server: TOKENS.ServerAdapter };
        const { server = NativeHttpServerAdapter } = config;
        this.providers = [
            {
                provide: TOKENS.ServerAdapter,
                useClass: server,
                isSingleton: true,
            },
        ];
    }
    async register(ioc) {
        const adapter = ioc.get(TOKENS.ServerAdapter);
        const router = ioc.get(TOKENS.Router);
        const registry = ioc.get(TOKENS.MiddlewareRegistry);
        const controllerConfigs = ioc.get(TOKENS.ControllerConfigs);
        router.init({
            resolver: ioc.get(TOKENS.ControllerResolver),
            controllerConfigs,
            middlewares: registry.all(),
        });
        adapter.on(async (req, res) => {
            const scope = ioc.createScope?.() ?? ioc;
            req.__ioc = scope;
            const method = req.method ?? 'GET';
            const url = req.url ?? '/';
            const handler = router.resolve(method, url, scope);
            if (!handler) {
                if (typeof res.statusCode === 'number')
                    res.statusCode = 404;
                res.end?.();
                return;
            }
            await Promise.resolve(handler(req, res));
        });
    }
}
//# sourceMappingURL=server-module.js.map