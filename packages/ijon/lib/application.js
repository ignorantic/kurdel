import http from 'http';
import { Router } from './router.js';
import { IoCContainer } from './ioc-container.js';
import { DatabaseSymbol } from './db/interfaces.js';
import { DatabaseFactory } from './db/database-factory.js';
export class Application {
    config;
    ioc;
    constructor(config) {
        this.config = config;
        this.ioc = new IoCContainer();
    }
    async start() {
        await this.connect();
        this.register();
        this.listen(this.config.port, () => {
            console.log(`Server is running on http://localhost:${this.config.port}\n`);
        });
    }
    async connect() {
        const driver = DatabaseFactory.createDriver(this.config.database);
        await driver.connect();
        this.ioc.registerInstance(DatabaseSymbol, driver.connection);
    }
    register() {
        const { controllers, models } = this.config;
        models.forEach((model) => {
            this.ioc.put(model, [DatabaseSymbol]);
        });
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
