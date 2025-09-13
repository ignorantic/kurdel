import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from './app-module.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { AppConfig } from '../config.js';
/**
 * MiddlewareModule
 *
 * - Registers global middlewares
 * - Provides MiddlewareRegistry as an export
 */
export declare class MiddlewareModule implements AppModule<AppConfig> {
    readonly exports: {
        registry: typeof MiddlewareRegistry;
    };
    register(ioc: IoCContainer, config: AppConfig): Promise<void>;
}
//# sourceMappingURL=middleware-module.d.ts.map