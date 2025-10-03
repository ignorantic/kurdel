import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from '../../api/app-module.js';
import { AppConfig } from '../../api/config.js';
import { ModelList } from '../../api/interfaces.js';
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
