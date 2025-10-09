import type { IoCContainer } from '@kurdel/ioc';
import type { AppModule, AppConfig } from '@kurdel/core/app';
import type { ModelList } from '@kurdel/core/db';
/**
 * ModelModule
 *
 * - Registers models from all HttpModules
 * - Models depend on IDatabase
 */
export declare class ModelModule implements AppModule<AppConfig> {
    private models;
    readonly imports: {
        db: symbol;
    };
    constructor(models: ModelList);
    register(ioc: IoCContainer): Promise<void>;
}
