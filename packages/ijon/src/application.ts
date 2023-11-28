import http from 'http';
import { Method } from './types.js';
import { Router } from './router.js';
import { Identifier, IoCContainer, Newable } from './ioc-container.js';
import { DatabaseSymbol } from './db/interfaces.js';
import { CombinedDatabaseConfig, DatabaseFactory } from './db/database-factory.js';
import { Model } from './model.js';
import { Controller } from 'controller.js';

export interface AppConfig {
  port: number;
  database: CombinedDatabaseConfig;
  models: Newable<Model>[];
  controllers: [Newable<Controller>, Identifier[]][];
} 

export class Application {
  private config: AppConfig;
  private ioc: IoCContainer;

  constructor(config: AppConfig) {
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
      this.ioc.put(model, [DatabaseSymbol])
    })
    controllers.forEach((controller) => {
      this.ioc.put(controller[0], controller[1]);
    });
    this.ioc.put(Router, controllers.map(controller => controller[0]));
  }

  listen(port: number, callback: () => void) {
    const server = http.createServer((req, res) => {
      const { method, url } = req;
      
      const router = this.ioc.get<Router>(Router);
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

