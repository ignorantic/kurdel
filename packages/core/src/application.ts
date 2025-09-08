import { Newable } from '@kurdel/common';
import { Identifier, IoCContainer } from '@kurdel/ioc';
import { IDatabase, DBConnector } from '@kurdel/db';
import { IServerAdapter } from './http/interfaces.js';
import { NativeHttpServerAdapter } from './http/native-http-server-adapter.js';
import { IoCControllerResolver } from './ioc-controller-resolver.js';
import { Router } from './router.js';
import { Model } from './model.js';
import { MiddlewareRegistry } from './middleware-registry.js';
import { Middleware } from './types.js';

export interface AppConfig {
  server?: Newable<IServerAdapter>;
  db?: Boolean;
  services?: Newable<{}>[];
  models?: Newable<Model>[];
  middlewares?: Middleware[];
  controllers?: [Newable<{}>, Identifier[]?, Middleware[]?][];
}

export const CONTROLLER_CLASSES = Symbol('CONTROLLER_CLASSES');

export class Application {
  private config: AppConfig;
  private ioc: IoCContainer;
  private dbConnector?: DBConnector;

  constructor(config: AppConfig) {
    this.config = config;
    this.ioc = new IoCContainer();
    if (this.config.db === undefined || this.config.db === true) {
      this.dbConnector = new DBConnector();
    }
  }

  static async create(config: AppConfig = {}): Promise<Application> {
    const app = new Application(config);
    await app.init();
    return app;
  }

  private async init() {
    if (this.dbConnector) {
      const dbConnection = await this.dbConnector.run();
      this.ioc.bind(IDatabase).toInstance(dbConnection);
    }

    const {
      services,
      models,
      controllers,
      middlewares,
      server = NativeHttpServerAdapter
    } = this.config;

    const registry = new MiddlewareRegistry();
    this.ioc.bind(MiddlewareRegistry).toInstance(registry);

    if (services) {
      services.forEach((service) => {
        this.ioc.put(service)
      })
    }
    
    if (models) {
      models.forEach((model) => {
        this.ioc.put(model).with([IDatabase])
      })
    }

    if (middlewares) {
      middlewares.forEach((middleware) => {
        registry.use(middleware);
      })
    }

    if (controllers) {
      controllers.forEach(([controller, dependencies, middlewares]) => {
        if (dependencies) {
          this.ioc.put(controller).with(dependencies);
        }
        if (middlewares) {
          middlewares.forEach((middleware) => {
            registry.useFor(controller, middleware);
          })
        }
      });
      this.ioc.bind(CONTROLLER_CLASSES).toInstance(controllers.map(([c]) => c));
      this.ioc.bind(IoCControllerResolver).toInstance(new IoCControllerResolver(this.ioc));
      this.ioc.put(Router).with([IoCControllerResolver, CONTROLLER_CLASSES, MiddlewareRegistry]);
    }
    this.ioc.bind(IServerAdapter).to(server).with([Router]);
  }

  listen(port: number, callback: () => void) {
    const server = this.ioc.get<IServerAdapter>(IServerAdapter);

    server.listen(port, callback);
  }
}

