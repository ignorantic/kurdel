import { IoCContainer } from '@kurdel/ioc';
import type { AppConfig } from '../api/config.js';
/**
 * Application
 *
 * Central orchestrator of the framework. Responsible for:
 * - Bootstrapping the IoC container
 * - Executing built-in and user-defined modules
 * - Aggregating controllers and middlewares from HttpModules
 * - Registering providers (classes, instances, factories)
 * - Validating imports/exports between modules
 */
export declare class Application {
    private readonly config;
    private readonly ioc;
    private readonly modules;
    constructor(config: AppConfig);
    /**
     * Factory method to create and initialize an Application instance.
     *
     * @param config Application configuration
     * @returns Initialized Application instance
     */
    static create(config?: AppConfig): Promise<Application>;
    /**
     * Initialize all modules:
     * - Validate imports
     * - Register providers (classes, instances, factories)
     * - Run custom registration logic
     * - Validate expected exports
     */
    private init;
    /**
     * Register a provider into the IoC container.
     *
     * Supports three strategies:
     * - useClass
     * - useInstance
     * - useFactory
     */
    private registerProvider;
    /**
     * Start listening on a given port using the configured server adapter.
     */
    listen(port: number, callback: () => void): void;
    /**
     * Expose underlying IoC container for advanced use cases.
     */
    getContainer(): IoCContainer;
}
