import http from 'http';
import { DBConnector } from './db/db-connector.js';
import { Router } from './router.js';
import { IoCContainer } from './ioc-container.js';
import { DATABASE_SYMBOL } from './consts.js';
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
        const { models, controllers } = this.config;
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
    }
    getDBConnection() {
        return this.ioc.get(DATABASE_SYMBOL);
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
