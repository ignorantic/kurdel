import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from './app-module.js';
import { AppConfig } from '../config.js';
/**
 * DatabaseModule
 *
 * - Provides a database connection if enabled
 * - Exports the IDatabase token
 * - Falls back to NoopDatabase when disabled
 */
export declare class DatabaseModule implements AppModule<AppConfig> {
    readonly exports: {
        db: symbol;
    };
    register(ioc: IoCContainer, config: AppConfig): Promise<void>;
}
//# sourceMappingURL=database-module.d.ts.map