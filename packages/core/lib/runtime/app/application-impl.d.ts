import { IoCContainer } from '@kurdel/ioc';
import type { Application } from '../../api/app/application.js';
import type { AppModule } from '../../api/app-module.js';
import type { AppConfig } from '../../api/config.js';
/**
 * Internal application implementation.
 * Orchestrates module loading, provider registration and server startup.
 */
export declare class ApplicationImpl implements Application {
    private readonly config;
    private readonly iocImpl;
    private readonly modules;
    /** Expose the container using the public IoC interface. */
    get container(): IoCContainer;
    constructor(config: AppConfig);
    /** Allow adding modules programmatically before bootstrap. */
    use(...modules: AppModule[]): void;
    /** Initialize modules: validate imports/exports and register providers. */
    private init;
    /** Register a provider using the current IoC container semantics. */
    private registerProvider;
    /** Start the server using the registered ServerAdapter. */
    listen(port: number, callback?: () => void): void;
    /** Internal bootstrap, called by the factory. */
    bootstrap(): Promise<void>;
}
