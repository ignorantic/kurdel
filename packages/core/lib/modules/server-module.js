import { IServerAdapter } from '../http/interfaces.js';
import { NativeHttpServerAdapter } from '../http/native-http-server-adapter.js';
import { Router } from '../router.js';
/**
 * ServerModule
 *
 * - Registers HTTP server adapter
 * - Depends on Router
 * - Exports IServerAdapter
 */
export class ServerModule {
    constructor(config) {
        this.imports = { router: Router };
        this.exports = { server: IServerAdapter };
        const { server = NativeHttpServerAdapter } = config;
        this.providers = [
            {
                provide: IServerAdapter,
                useClass: server,
                deps: { router: Router },
                isSingleton: true,
            },
        ];
    }
    async register(_ioc) {
        // No-op (everything in providers)
    }
}
//# sourceMappingURL=server-module.js.map