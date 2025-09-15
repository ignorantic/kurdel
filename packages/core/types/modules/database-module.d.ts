import { IoCContainer } from '@kurdel/ioc';
import { IDatabase } from '@kurdel/db';
import { AppModule } from './app-module.js';
import { AppConfig } from '../config.js';
export declare class NoopDatabase implements IDatabase {
    query: () => Promise<void>;
    get: () => Promise<void>;
    all: () => Promise<void>;
    run: () => Promise<void>;
    close: () => Promise<void>;
    private error;
}
/**
 * DatabaseModule
 *
 * - Provides a database connection if enabled
 * - Exports the IDatabase token
 * - Falls back to NoopDatabase when disabled
 */
export declare class DatabaseModule implements AppModule<AppConfig> {
    readonly exports: {
        db: any;
    };
    register(ioc: IoCContainer, config: AppConfig): Promise<void>;
}
//# sourceMappingURL=database-module.d.ts.map