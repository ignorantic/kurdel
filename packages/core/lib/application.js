import { IoCContainer } from '@kurdel/ioc';
import { IServerAdapter } from './http/interfaces.js';
import { DatabaseInitializer } from './initializers/database-initializer.js';
import { MiddlewareInitializer } from './initializers/middleware-initializer.js';
import { ServiceInitializer } from './initializers/service-initializer.js';
import { ModelInitializer } from './initializers/model-initializer.js';
import { ControllerInitializer } from './initializers/controller-initializer.js';
import { ServerInitializer } from './initializers/server-initializer.js';
/**
 * Main application orchestrator.
 * Delegates setup work to initializers.
 */
export class Application {
    constructor(config) {
        this.config = config;
        this.ioc = new IoCContainer();
    }
    static async create(config = {}) {
        const app = new Application(config);
        await app.init();
        return app;
    }
    async init() {
        const initializers = [
            new DatabaseInitializer(),
            new MiddlewareInitializer(),
            new ServiceInitializer(),
            new ModelInitializer(),
            new ControllerInitializer(),
            new ServerInitializer(),
        ];
        for (const initializer of initializers) {
            await initializer.run(this.ioc, this.config);
        }
    }
    listen(port, callback) {
        const server = this.ioc.get(IServerAdapter);
        server.listen(port, callback);
    }
    getContainer() {
        return this.ioc;
    }
}
//# sourceMappingURL=application.js.map