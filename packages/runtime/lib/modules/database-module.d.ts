import { IoCContainer } from '@kurdel/ioc';
import { IDatabase } from '@kurdel/db';
import type { AppConfig, AppModule } from '@kurdel/core/app';
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
        db: symbol;
    };
    register(ioc: IoCContainer, config: AppConfig): Promise<void>;
}
