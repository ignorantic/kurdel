import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from '../app-module.js';
import { RunningServer } from '../interfaces.js';
/**
 * Public application contract.
 * Exposes a DI container (by interface), allows composing modules,
 * and starting the HTTP server via a façade in the runtime.
 */
export interface Application {
    /** DI container exposed by interface type (implementation is hidden). */
    readonly container: IoCContainer;
    /** Register additional modules before startup. */
    use(...modules: AppModule[]): void;
    /**
     * Start the server and get a handle for tests and shutdown.
     * Kept compatible with previous signature by making callback optional.
     */
    listen(port: number, callback?: () => void): RunningServer;
    /**
     * Expose underlying IoC container for advanced use cases.
     */
    getContainer(): IoCContainer;
}
