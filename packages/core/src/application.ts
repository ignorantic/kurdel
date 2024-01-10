import { Newable } from '@kurdel/common';
import { Identifier, IoCContainer } from '@kurdel/ioc';
import { DBConnector } from './db/db-connector.js';
import { HttpServerAdapter } from './http/interfaces.js';
import { NativeHttpServerAdapter } from './http/native-http-server-adapter.js';
import { Router } from './router.js';
import { Model } from './model.js';
import { DATABASE_SYMBOL, HTTP_SERVER_SYMBOL } from './consts.js';

export interface AppConfig {
  http?: Newable<HttpServerAdapter>;
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
    const { models, controllers, http = NativeHttpServerAdapter } = this.config;
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
    this.ioc.register(HTTP_SERVER_SYMBOL, http, [Router]);
  }

  listen(port: number, callback: () => void) {
    const server = this.ioc.get<HttpServerAdapter>(HTTP_SERVER_SYMBOL);

    server.listen(port, callback);
  }
}

