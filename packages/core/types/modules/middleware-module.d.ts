import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from './app-module.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Middleware } from '../types.js';
/**
 * MiddlewareModule
 *
 * - Registers global middlewares from all HttpModules
 */
export declare class MiddlewareModule implements AppModule {
    private middlewares;
    readonly exports: {
        registry: typeof MiddlewareRegistry;
    };
    readonly providers: {
        provide: typeof MiddlewareRegistry;
        useClass: typeof MiddlewareRegistry;
        isSingleton: boolean;
    }[];
    constructor(middlewares: Middleware[]);
    register(ioc: IoCContainer): Promise<void>;
}
//# sourceMappingURL=middleware-module.d.ts.map