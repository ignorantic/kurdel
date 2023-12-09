import http from 'http';
import { Method, Newable } from './types.js';
import { DBConnector } from './db/db-connector.js';
import { Router } from './router.js';
import { Identifier, IoCContainer } from './ioc-container.js';
import { Model } from './model.js';
import { DATABASE_SYMBOL } from './consts.js';
import { IDatabase } from 'index.js';

export interface AppConfig {
  models?: Newable<Model>[];
  controllers?: [Newable<{}>, Identifier[]][];
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

  static async create(config: AppConfig = {}): Promise<Application> {
    const app = new Application(config);
    await app.init();
    return app;
  }

  private async init() {
    const dbConnection = await this.dbConnector.run();
    this.ioc.registerInstance(DATABASE_SYMBOL, dbConnection);
    const { models, controllers } = this.config;
    if (models) {
      models.forEach((model) => {
        this.ioc.put(model, [DATABASE_SYMBOL])
      })
    }
    if (controllers) {
      controllers.forEach((controller) => {
        this.ioc.put(...controller);
      });
      this.ioc.put(Router, controllers.map(controller => controller[0]));
    }
  }

  getDBConnection(): IDatabase {
    return this.ioc.get(DATABASE_SYMBOL);
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

