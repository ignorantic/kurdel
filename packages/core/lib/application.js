import { IoCContainer } from '@kurdel/ioc';
import { IServerAdapter } from './http/interfaces.js';
import { DatabaseModule } from './modules/database-module.js';
import { ServiceModule } from './modules/service-module.js';
import { ModelModule } from './modules/model-module.js';
import { MiddlewareModule } from './modules/middleware-module.js';
import { ControllerModule } from './modules/controller-module.js';
import { ServerModule } from './modules/server-module.js';
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
export class Application {
    constructor(config) {
        /** List of built-in modules */
        this.modules = [
            DatabaseModule,
            ServiceModule,
            ModelModule,
            MiddlewareModule,
            ControllerModule,
            ServerModule,
        ];
        this.config = config;
        this.ioc = new IoCContainer();
    }
    /**
     * Factory method: create and initialize a new Application instance.
     *
     * @param config Application configuration
     * @returns Initialized Application instance
     */
    static async create(config = {}) {
        const app = new Application(config);
        await app.init();
        return app;
    }
    /**
     * Initialize application by running all modules.
     *
     * - Validates module imports/exports
     * - Registers dependencies in IoC
     * - Builds middleware pipeline
     * - Configures controllers and server
     */
    async init() {
        for (const module of this.modules) {
            // validate imports
            if (module.imports) {
                Object.values(module.imports).forEach((dep) => {
                    if (!this.ioc.has(dep)) {
                        throw new Error(`Missing dependency: ${String(dep.toString())}`);
                    }
                });
            }
            // register module
            await module.register(this.ioc, this.config);
            // validate exports
            if (module.exports) {
                Object.values(module.exports).forEach((token) => {
                    if (!this.ioc.has(token)) {
                        throw new Error(`Module did not register expected export: ${String(token.toString())}`);
                    }
                });
            }
        }
    }
    /**
     * Start listening for incoming HTTP requests.
     *
     * @param port Port number
     * @param callback Callback executed once server is running
     */
    listen(port, callback) {
        const server = this.ioc.get(IServerAdapter);
        server.listen(port, callback);
    }
    /**
     * Access underlying IoC container (useful for testing or advanced scenarios).
     *
     * @returns IoCContainer instance
     */
    getContainer() {
        return this.ioc;
    }
}
//# sourceMappingURL=application.js.map