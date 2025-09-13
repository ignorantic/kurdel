import { IoCContainer } from '@kurdel/ioc';
import type { AppConfig } from './config.js';
/**
 * Application
 *
 * Central orchestrator of the framework. Responsible for:
 * - Bootstrapping IoC container
 * - Executing built-in and user-defined modules
 * - Registering providers (useClass, useInstance, useFactory)
 * - Validating imports/exports between modules
 */
export declare class Application {
    /** Application configuration object */
    private readonly config;
    /** Underlying IoC container */
    private readonly ioc;
    /** List of all modules (built-in + custom from config) */
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
     * - Validate required imports
     * - Register providers (classes, instances, factories)
     * - Run optional custom module logic
     * - Validate expected exports
     */
    private init;
    /**
     * Register a provider into the IoC container.
     *
     * Supports three strategies:
     * - useClass: binds a class (optionally with dependencies and singleton scope)
     * - useInstance: binds an existing instance
     * - useFactory: binds a factory function (singleton or transient)
     *
     * @param provider Provider configuration object
     */
    private registerProvider;
    /**
      * Register a provider into the IoC container.
      *
      * Supports three strategies:
      * - useClass: binds a class (optionally with dependencies and singleton scope)
      * - useInstance: binds an existing instance
      * - useFactory: binds a factory function (singleton or transient)
      *
      * @param provider Provider configuration object
      */
    listen(port: number, callback: () => void): void;
    /**
     * Expose underlying IoC container
     *
     * Useful for:
     * - Unit tests
     * - Advanced dependency management
     * - Manual resolution of services
     *
     * @returns IoCContainer instance
     */
    getContainer(): IoCContainer;
}
//# sourceMappingURL=application.d.ts.map