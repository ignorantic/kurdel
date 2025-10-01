import { NativeHttpServerAdapter } from 'src/adapters/native-http-server-adapter.js';
import { Router } from 'src/runtime/router.js';
import { ServerAdapter } from '../../api/interfaces.js';
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
        this.exports = { server: ServerAdapter };
        const { server = NativeHttpServerAdapter } = config;
        this.providers = [
            {
                provide: ServerAdapter,
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