import http from 'http';
import { DatabaseFactory } from './db/database-factory.js';
export class Application {
    config;
    ioc;
    constructor(config, ioc) {
        this.config = config;
        this.ioc = ioc;
    }
    async start() {
        await this.connect();
        this.listen(this.config.port, () => {
            console.log(`Server is running on http://localhost:${this.config.port}\n`);
        });
    }
    async connect() {
        const driver = DatabaseFactory.createDriver(this.config.database);
        await driver.connect();
        this.ioc.registerInstance('db', driver.connection);
    }
    listen(port, callback) {
        const server = http.createServer((req, res) => {
            const { method, url } = req;
            const router = this.ioc.resolve('Router');
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
