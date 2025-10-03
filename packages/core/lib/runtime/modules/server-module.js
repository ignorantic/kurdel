import { NativeHttpServerAdapter } from '../../adapters/native-http-server-adapter.js';
import { Router } from '../../runtime/router.js';
import { TOKENS } from '../../api/tokens.js';
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
        this.exports = { server: TOKENS.ServerAdapter };
        const { server = NativeHttpServerAdapter } = config;
        this.providers = [
            {
                provide: TOKENS.ServerAdapter,
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