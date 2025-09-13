import { IoCContainer } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from './app-module.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Router } from '../router.js';
import { AppConfig } from '../config.js';
/**
 * ControllerModule
 *
 * - Registers controllers from AppConfig
 * - Wires Router with IoCControllerResolver and MiddlewareRegistry
 * - Exports Router and CONTROLLER_CLASSES
 */
export declare class ControllerModule implements AppModule<AppConfig> {
    readonly imports: {
        registry: typeof MiddlewareRegistry;
    };
    readonly exports: {
        controllers: symbol;
        router: typeof Router;
    };
    readonly providers: ProviderConfig[];
    constructor(config: AppConfig);
    register(_ioc: IoCContainer): Promise<void>;
}
//# sourceMappingURL=controller-module.d.ts.map