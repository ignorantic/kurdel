import { Newable } from '@kurdel/common';
import { Identifier, IoCContainer } from '@kurdel/ioc';
import { IDatabase } from './db/interfaces.js';
import { DBConnector } from './db/db-connector.js';
import { IHttpServerAdapter } from './http/interfaces.js';
import { NativeHttpServerAdapter } from './http/native-http-server-adapter.js';
import { Router } from './router.js';
import { Model } from './model.js';

export interface AppConfig {
  http?: Newable<IHttpServerAdapter>;
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
    this.ioc.bind(IDatabase).toInstance(dbConnection);
    const { models, controllers, http = NativeHttpServerAdapter } = this.config;
    if (models) {
      models.forEach((model) => {
        this.ioc.put(model).with([IDatabase])
      })
    }
    if (controllers) {
      controllers.forEach(([controller, dependencies]) => {
        this.ioc.put(controller).with(dependencies);
      });
      this.ioc.put(Router).with(controllers.map(([controller]) => controller));
    }
    this.ioc.bind(IHttpServerAdapter).to(http).with([Router]);
  }

  listen(port: number, callback: () => void) {
    const server = this.ioc.get<IHttpServerAdapter>(IHttpServerAdapter);

    server.listen(port, callback);
  }
}

