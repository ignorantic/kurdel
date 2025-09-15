import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from './app-module.js';
import { AppConfig } from '../config.js';
/**
 * ModelModule
 *
 * - Registers application models from AppConfig
 * - Models depend on IDatabase
 */
export declare class ModelModule implements AppModule<AppConfig> {
    readonly imports: {
        db: any;
    };
    register(ioc: IoCContainer, config: AppConfig): Promise<void>;
}
//# sourceMappingURL=model-module.d.ts.map