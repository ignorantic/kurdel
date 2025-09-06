import { IoCContainer } from '@kurdel/ioc';
import { IDatabase, DBConnector } from '@kurdel/db';
import { IServerAdapter } from './http/interfaces.js';
import { NativeHttpServerAdapter } from './http/native-http-server-adapter.js';
import { Router } from './router.js';
export class IoCControllerResolver {
    constructor(container) {
        this.container = container;
    }
    get(cls) {
        return this.container.get(cls);
    }
}
export const CONTROLLER_CLASSES = Symbol('CONTROLLER_CLASSES');
export class Application {
    constructor(config) {
        this.config = config;
        this.ioc = new IoCContainer();
        this.dbConnector = new DBConnector();
    }
    static async create(config = {}) {
        const app = new Application(config);
        await app.init();
        return app;
    }
    async init() {
        const dbConnection = await this.dbConnector.run();
        this.ioc.bind(IDatabase).toInstance(dbConnection);
        const { models, controllers, server = NativeHttpServerAdapter } = this.config;
        if (models) {
            models.forEach((model) => {
                this.ioc.put(model).with([IDatabase]);
            });
        }
        if (controllers) {
            controllers.forEach(([controller, dependencies]) => {
                this.ioc.put(controller).with(dependencies);
            });
            this.ioc.bind(CONTROLLER_CLASSES).toInstance(controllers.map(([c]) => c));
            this.ioc.bind(IoCControllerResolver).toInstance(new IoCControllerResolver(this.ioc));
            this.ioc.put(Router).with([IoCControllerResolver, CONTROLLER_CLASSES]);
        }
        this.ioc.bind(IServerAdapter).to(server).with([Router]);
    }
    listen(port, callback) {
        const server = this.ioc.get(IServerAdapter);
        server.listen(port, callback);
    }
}
//# sourceMappingURL=application.js.map