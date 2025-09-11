import { IServerAdapter } from '../http/interfaces.js';
import { NativeHttpServerAdapter } from '../http/native-http-server-adapter.js';
import { Router } from '../router.js';
export class ServerInitializer {
    run(ioc, config) {
        const server = config.server ?? NativeHttpServerAdapter;
        ioc.bind(IServerAdapter).to(server).inSingletonScope().with({ router: Router });
    }
}
//# sourceMappingURL=server-initializer.js.map