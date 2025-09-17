import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from 'src/modules/app-module.js';
import { AppConfig } from 'src/config.js';
import { ModelList } from 'src/http/interfaces.js';
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
//# sourceMappingURL=model-module.d.ts.map