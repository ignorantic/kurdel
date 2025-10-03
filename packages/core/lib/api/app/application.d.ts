import type { IoCContainer } from '@kurdel/ioc';
import type { AppModule } from '../app-module.js';
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
     * Start the HTTP server.
     * Signature kept for backward compatibility with existing apps.
     */
    listen(port: number, callback?: () => void): void;
}
