import http from 'http';
import { Method } from './types.js';
import { Router } from './router.js';
import { IoCContainer } from './ioc-container.js';
import { CombinedDatabaseConfig, DatabaseFactory } from './db/database-factory.js';

export interface AppConfig {
  port: number;
  database: CombinedDatabaseConfig;
} 

export class Application {
  private config: AppConfig;
  private ioc: IoCContainer;

  constructor(config: AppConfig, ioc: IoCContainer) {
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

  listen(port: number, callback: () => void) {
    const server = http.createServer((req, res) => {
      const { method, url } = req;
      
      const router = this.ioc.resolve<Router>('Router');
      const handler = router.resolve(method as Method, url as string);

      if (handler) {
        handler(req, res);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });

    server.listen(port, callback);
  }
}

