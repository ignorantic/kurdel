import { IoCContainer } from '@kurdel/ioc';
import { IServerAdapter } from './http/interfaces.js';
import { AppConfig } from './config.js';
import { Initializer } from './initializers/initializer.js';
import { DatabaseInitializer } from './initializers/database-initializer.js';
import { MiddlewareInitializer } from './initializers/middleware-initializer.js';
import { ServiceInitializer } from './initializers/service-initializer.js';
import { ModelInitializer } from './initializers/model-initializer.js';
import { ControllerInitializer } from './initializers/controller-initializer.js';
import { ServerInitializer } from './initializers/server-initializer.js';

/**
 * Main application orchestrator.
 * Delegates setup work to initializers.
 */
export class Application {
  private ioc = new IoCContainer();

  constructor(private readonly config: AppConfig) {}

  static async create(config: AppConfig = {}): Promise<Application> {
    const app = new Application(config);
    await app.init();
    return app;
  }

  private async init() {
    const initializers: Initializer[] = [
      new DatabaseInitializer(),
      new MiddlewareInitializer(),
      new ServiceInitializer(),
      new ModelInitializer(),
      new ControllerInitializer(),
      new ServerInitializer(),
    ];

    for (const initializer of initializers) {
      await initializer.run(this.ioc, this.config);
    }
  }

  public listen(port: number, callback: () => void) {
    const server = this.ioc.get<IServerAdapter>(IServerAdapter);
    server.listen(port, callback);
  }

  public getContainer(): IoCContainer {
    return this.ioc;
  }
}
