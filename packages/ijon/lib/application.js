import http from 'http';
import { Router } from './router.js';
import { IoCContainer } from './ioc-container.js';
import { DatabaseSymbol } from './db/interfaces.js';
import { DBConnector } from './db/db-connector.js';
export class Application {
    config;
    ioc;
    dbConnector;
    constructor(config) {
        this.config = config;
        this.ioc = new IoCContainer();
        this.dbConnector = new DBConnector();
    }
    static async create(config) {
        const app = new Application(config);
        await app.init();
        return app;
    }
    async init() {
        const dbConnection = await this.dbConnector.run();
        this.ioc.registerInstance(DatabaseSymbol, dbConnection);
        this.registerModels();
        this.registerControllers();
    }
    registerModels() {
        const { models } = this.config;
        models.forEach((model) => {
            this.ioc.put(model, [DatabaseSymbol]);
        });
    }
    registerControllers() {
        const { controllers } = this.config;
        controllers.forEach((controller) => {
            this.ioc.put(controller[0], controller[1]);
        });
        this.ioc.put(Router, controllers.map(controller => controller[0]));
    }
    listen(port, callback) {
        const server = http.createServer((req, res) => {
            const { method, url } = req;
            const router = this.ioc.get(Router);
            const handler = router.resolve(method, url);
            if (handler) {
                handler(req, res);
            }
            else {
                res.statusCode = 404;
                res.end('Not Found');
            }
        });
        server.listen(port, callback);
    }
}
