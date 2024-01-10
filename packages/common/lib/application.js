import { DBConnector } from './db/db-connector.js';
import { NativeHttpServerAdapter } from './http/native-http-server-adapter.js';
import { Router } from './router.js';
import { IoCContainer } from './ioc-container.js';
import { DATABASE_SYMBOL, HTTP_SERVER_SYMBOL } from './consts.js';
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
        this.ioc.registerInstance(DATABASE_SYMBOL, dbConnection);
        const { models, controllers, http = NativeHttpServerAdapter } = this.config;
        if (models) {
            models.forEach((model) => {
                this.ioc.put(model, [DATABASE_SYMBOL]);
            });
        }
        if (controllers) {
            controllers.forEach((controller) => {
                this.ioc.put(...controller);
            });
            this.ioc.put(Router, controllers.map(controller => controller[0]));
        }
        this.ioc.register(HTTP_SERVER_SYMBOL, http, [Router]);
    }
    listen(port, callback) {
        const server = this.ioc.get(HTTP_SERVER_SYMBOL);
        server.listen(port, callback);
    }
}
