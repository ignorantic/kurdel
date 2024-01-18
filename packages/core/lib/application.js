import { IoCContainer } from '@kurdel/ioc';
import { IDatabase } from './db/interfaces.js';
import { DBConnector } from './db/db-connector.js';
import { IHttpServerAdapter } from './http/interfaces.js';
import { NativeHttpServerAdapter } from './http/native-http-server-adapter.js';
import { Router } from './router.js';
export class Application {
    config;
    ioc;
    dbConnector;
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
        const { models, controllers, http = NativeHttpServerAdapter } = this.config;
        if (models) {
            models.forEach((model) => {
                this.ioc.put(model).with([IDatabase]);
            });
        }
        if (controllers) {
            controllers.forEach(([controller, dependencies]) => {
                this.ioc.put(controller).with(dependencies);
            });
            this.ioc.put(Router).with(controllers.map(([controller]) => controller));
        }
        this.ioc.bind(IHttpServerAdapter).to(http).with([Router]);
    }
    listen(port, callback) {
        const server = this.ioc.get(IHttpServerAdapter);
        server.listen(port, callback);
    }
}
