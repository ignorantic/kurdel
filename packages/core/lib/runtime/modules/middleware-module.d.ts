import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from '../../api/app-module.js';
import { MiddlewareRegistry } from '../../runtime/middleware-registry.js';
import { Middleware } from '../../api/types.js';
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
