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
import { errorHandler } from './middlewares/error-handle.js';
import { Controller } from './controller.js';

interface ControllerConfig {
  use: Newable<Controller<any>>;
  deps?: Record<string, Identifier>;
  middlewares?: Middleware[];
  prefix?: string;
}

export interface AppConfig {
  server?: Newable<IServerAdapter>;
  db?: boolean;
  services?: Newable<{}>[];
  models?: Newable<Model>[];
  middlewares?: Middleware[];
  controllers?: ControllerConfig[];
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
      server = NativeHttpServerAdapter,
    } = this.config;

    this.ioc.put(MiddlewareRegistry).inSingletonScope();
    const registry = this.ioc.get(MiddlewareRegistry);

    if (services) {
      services.forEach((service) => {
        this.ioc.put(service);
      });
    }

    if (models) {
      models.forEach((model) => {
        this.ioc.put(model).with({ db: IDatabase });
      });
    }

    if (middlewares) {
      middlewares.forEach((mw) => registry.use(mw));
    }

    registry.use(errorHandler);

    if (controllers) {
      controllers.forEach(({ use, deps, middlewares }) => {
        if (deps) {
          this.ioc.put(use).with(deps);
        } else {
          this.ioc.put(use);
        }

        if (middlewares) {
          middlewares.forEach((mw) => {
            registry.useFor(use, mw);
          });
        }
      });

      this.ioc.bind(CONTROLLER_CLASSES).toInstance(controllers.map(c => c.use));
      this.ioc.bind(IoCControllerResolver).toInstance(new IoCControllerResolver(this.ioc));
      this.ioc.put(Router).with({
        resolver: IoCControllerResolver,
        controllers: CONTROLLER_CLASSES,
        registry: MiddlewareRegistry,
      });
    }

    this.ioc.bind(IServerAdapter).to(server).with({ router: Router });
  }

  listen(port: number, callback: () => void) {
    const server = this.ioc.get<IServerAdapter>(IServerAdapter);
    server.listen(port, callback);
  }
}


