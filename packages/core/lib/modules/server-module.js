import { IServerAdapter } from '../http/interfaces.js';
import { NativeHttpServerAdapter } from '../http/native-http-server-adapter.js';
import { Router } from '../router.js';
/**
 * ServerModule
 *
 * - Exports: IServerAdapter (bound to configured server)
 * - Imports: Router
 *
 * Binds the HTTP server adapter into IoC.
 * Defaults to NativeHttpServerAdapter if none provided in config.
 * Always uses singleton scope.
 */
export const ServerModule = {
    imports: { router: Router },
    exports: { server: IServerAdapter },
    register(ioc, config) {
        const server = config.server ?? NativeHttpServerAdapter;
        ioc.bind(IServerAdapter).to(server).inSingletonScope().with({ router: Router });
    },
};
//# sourceMappingURL=server-module.js.map