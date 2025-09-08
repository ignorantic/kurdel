import { IoCContainer } from '@kurdel/ioc';
import { IDatabase, DBConnector } from '@kurdel/db';
import { IServerAdapter } from './http/interfaces.js';
import { NativeHttpServerAdapter } from './http/native-http-server-adapter.js';
import { IoCControllerResolver } from './ioc-controller-resolver.js';
import { Router } from './router.js';
import { MiddlewareRegistry } from './middleware-registry.js';
export const CONTROLLER_CLASSES = Symbol('CONTROLLER_CLASSES');
export class Application {
    constructor(config) {
        this.config = config;
        this.ioc = new IoCContainer();
        if (this.config.db === undefined || this.config.db === true) {
            this.dbConnector = new DBConnector();
        }
    }
    static async create(config = {}) {
        const app = new Application(config);
        await app.init();
        return app;
    }
    async init() {
        if (this.dbConnector) {
            const dbConnection = await this.dbConnector.run();
            this.ioc.bind(IDatabase).toInstance(dbConnection);
        }
        const { services, models, controllers, middlewares, server = NativeHttpServerAdapter } = this.config;
        const registry = new MiddlewareRegistry();
        this.ioc.bind(MiddlewareRegistry).toInstance(registry);
        if (services) {
            services.forEach((service) => {
                this.ioc.put(service);
            });
        }
        if (models) {
            models.forEach((model) => {
                this.ioc.put(model).with([IDatabase]);
            });
        }
        if (middlewares) {
            middlewares.forEach((middleware) => {
                registry.use(middleware);
            });
        }
        if (controllers) {
            controllers.forEach(([controller, dependencies, middlewares]) => {
                if (dependencies) {
                    this.ioc.put(controller).with(dependencies);
                }
                if (middlewares) {
                    middlewares.forEach((middleware) => {
                        registry.useFor(controller, middleware);
                    });
                }
            });
            this.ioc.bind(CONTROLLER_CLASSES).toInstance(controllers.map(([c]) => c));
            this.ioc.bind(IoCControllerResolver).toInstance(new IoCControllerResolver(this.ioc));
            this.ioc.put(Router).with([IoCControllerResolver, CONTROLLER_CLASSES, MiddlewareRegistry]);
        }
        this.ioc.bind(IServerAdapter).to(server).with([Router]);
    }
    listen(port, callback) {
        const server = this.ioc.get(IServerAdapter);
        server.listen(port, callback);
    }
}
//# sourceMappingURL=application.js.map