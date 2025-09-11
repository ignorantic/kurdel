import { IoCContainer } from '@kurdel/ioc';
import { AppConfig } from './config.js';
/**
 * Application
 *
 * Main entry point of the framework. Bootstraps the IoC container,
 * runs all application modules, and wires up the HTTP server.
 *
 * Responsibilities:
 * - Orchestrates initialization of database, services, models, middlewares,
 *   controllers, and server.
 * - Provides a simple API for creating an application instance and starting
 *   the server.
 * - Enforces module contracts via imports/exports.
 */
export declare class Application {
    /** Application configuration (controllers, models, services, etc.) */
    private readonly config;
    /** IoC container instance */
    private readonly ioc;
    /** List of built-in modules */
    private readonly modules;
    constructor(config: AppConfig);
    /**
     * Factory method: create and initialize a new Application instance.
     *
     * @param config Application configuration
     * @returns Initialized Application instance
     */
    static create(config?: AppConfig): Promise<Application>;
    /**
     * Initialize application by running all modules.
     *
     * - Validates module imports/exports
     * - Registers dependencies in IoC
     * - Builds middleware pipeline
     * - Configures controllers and server
     */
    private init;
    /**
     * Start listening for incoming HTTP requests.
     *
     * @param port Port number
     * @param callback Callback executed once server is running
     */
    listen(port: number, callback: () => void): void;
    /**
     * Access underlying IoC container (useful for testing or advanced scenarios).
     *
     * @returns IoCContainer instance
     */
    getContainer(): IoCContainer;
}
//# sourceMappingURL=application.d.ts.map