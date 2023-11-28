import http from 'http';
import { Router } from './router.js';
import { IoCContainer } from './ioc-container.js';
import { DatabaseSymbol } from './db/interfaces.js';
import { DatabaseFactory } from './db/database-factory.js';
import { JSONLoader } from './json-loader.js';
export class Application {
    config;
    ioc;
    jsonLoader;
    constructor(config) {
        this.config = config;
        this.ioc = new IoCContainer();
        this.jsonLoader = new JSONLoader();
    }
    static async create(config) {
        const app = new Application(config);
        await app.init();
        return app;
    }
    async init() {
        const dbConfig = this.jsonLoader.load('./db.config.json');
        const dbConnection = await this.connectDB(dbConfig);
        this.ioc.registerInstance(DatabaseSymbol, dbConnection);
        this.registerModels();
        this.registerControllers();
    }
    async connectDB(dbConfig) {
        const driver = DatabaseFactory.createDriver(dbConfig);
        await driver.connect();
        if (!driver.connection) {
            throw new Error('Database connection failed');
        }
        return driver.connection;
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
