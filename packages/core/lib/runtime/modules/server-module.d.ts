import { IoCContainer } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from '../../api/app-module.js';
import { Router } from '../../runtime/router.js';
import { AppConfig } from '../../api/config.js';
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
        server: import("@kurdel/ioc").InjectionToken<import("../../index.js").ServerAdapter>;
    };
    readonly providers: ProviderConfig[];
    constructor(config: AppConfig);
    register(_ioc: IoCContainer): Promise<void>;
}
