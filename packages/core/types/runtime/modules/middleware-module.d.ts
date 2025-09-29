import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from 'src/api/app-module.js';
import { MiddlewareRegistry } from 'src/runtime/middleware-registry.js';
import { Middleware } from 'src/api/types.js';
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