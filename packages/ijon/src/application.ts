import http from 'http';
import { Method } from './types.js';
import { Router } from './router.js';
import { Identifier, IoCContainer, Newable } from './ioc-container.js';
import { DatabaseSymbol, IDatabase } from './db/interfaces.js';
import { CombinedDatabaseConfig, DatabaseFactory } from './db/database-factory.js';
import { Model } from './model.js';
import { JSONLoader } from './json-loader.js';

export interface AppConfig {
  models: Newable<Model>[];
  controllers: [Newable<{}>, Identifier[]][];
} 

export class Application {
  private config: AppConfig;
  private ioc: IoCContainer;
  private jsonLoader: JSONLoader;

  constructor(config: AppConfig) {
    this.config = config;
    this.ioc = new IoCContainer();
    this.jsonLoader = new JSONLoader();
  }

  static async create(config: AppConfig): Promise<Application> {
    const app = new Application(config);
    await app.init();
    return app;
  }

  private async init() {
    const dbConfig = this.jsonLoader.load('./db.config.json');
    const dbConnection = await this.connectDB(dbConfig);
    this.ioc.registerInstance(DatabaseSymbol, dbConnection);
    this.registerModels();
    this.registerControllers();
  }

  private async connectDB(dbConfig: CombinedDatabaseConfig): Promise<IDatabase> {
    const driver = DatabaseFactory.createDriver(dbConfig);
    await driver.connect();
    if (!driver.connection) {
      throw new Error('Database connection failed');
    } 
    return driver.connection;
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

