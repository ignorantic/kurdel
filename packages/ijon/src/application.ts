import http from 'http';
import { Method } from './types.js';
import { Router } from './router.js';
import { Identifier, IoCContainer, Newable } from './ioc-container.js';
import { DatabaseSymbol } from './db/interfaces.js';
import { DBConnector } from './db/db-connector.js';
import { Model } from './model.js';

export interface AppConfig {
  models: Newable<Model>[];
  controllers: [Newable<{}>, Identifier[]][];
} 

export class Application {
  private config: AppConfig;
  private ioc: IoCContainer;
  private dbConnector: DBConnector;

  constructor(config: AppConfig) {
    this.config = config;
    this.ioc = new IoCContainer();
    this.dbConnector = new DBConnector();
  }

  static async create(config: AppConfig): Promise<Application> {
    const app = new Application(config);
    await app.init();
    return app;
  }

  private async init() {
    const dbConnection = await this.dbConnector.run();
    this.ioc.registerInstance(DatabaseSymbol, dbConnection);
    this.registerModels();
    this.registerControllers();
  }

  private registerModels() {
    const { models } = this.config;
    models.forEach((model) => {
      this.ioc.put(model, [DatabaseSymbol])
    })
  }

  private registerControllers() {
    const { controllers } = this.config;
    controllers.forEach((controller) => {
      this.ioc.put(controller[0], controller[1]);
    });
    this.ioc.put(Router, controllers.map(controller => controller[0]));
  }

  listen(port: number, callback: () => void) {
    const server = http.createServer((req, res) => {
      const { method, url } = req;
      
      const router = this.ioc.get(Router);
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

