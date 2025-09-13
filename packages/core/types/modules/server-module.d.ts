import { AppModule, ProviderConfig } from './app-module.js';
import { IoCContainer } from '@kurdel/ioc';
import { Router } from '../router.js';
import { AppConfig } from '../config.js';
/**
 * ServerModule
 *
 * - Registers HTTP server adapter
 * - Depends on Router
 * - Exports IServerAdapter
 */
export declare class ServerModule implements AppModule<AppConfig> {
    readonly imports: {
        router: typeof Router;
    };
    readonly exports: {
        server: symbol;
    };
    readonly providers: ProviderConfig[];
    constructor(config: AppConfig);
    register(_ioc: IoCContainer): Promise<void>;
}
//# sourceMappingURL=server-module.d.ts.map