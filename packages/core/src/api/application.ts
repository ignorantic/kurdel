import { IoCContainer } from '@kurdel/ioc';
import type { AppConfig } from 'src/api/config.js';
import type { AppModule, ProviderConfig } from 'src/api/app-module.js';
import { DatabaseModule } from 'src/runtime/modules/database-module.js';
import { ModelModule } from 'src/runtime/modules/model-module.js';
import { MiddlewareModule } from 'src/runtime/modules/middleware-module.js';
import { ControllerModule } from 'src/runtime/modules/controller-module.js';
import { ServerModule } from 'src/runtime/modules/server-module.js';
import { ModelList } from 'src/api/interfaces.js';
import type { HttpModule } from 'src/api/http-module.js';
import type { Middleware } from 'src/api/types.js';
import { ControllerConfig } from 'src/api/interfaces.js';
import { IServerAdapter } from './interfaces.js';

/**
 * Application
 *
 * Central orchestrator of the framework. Responsible for:
 * - Bootstrapping the IoC container
 * - Executing built-in and user-defined modules
 * - Aggregating controllers and middlewares from HttpModules
 * - Registering providers (classes, instances, factories)
 * - Validating imports/exports between modules
 */
export class Application {
  private readonly config: AppConfig;
  private readonly ioc: IoCContainer;
  private readonly modules: AppModule[];

  constructor(config: AppConfig) {
    this.config = config;
    this.ioc = new IoCContainer();

    // Collect models, controllers and middlewares from HttpModules
    const httpModules = (config.modules ?? []).filter(
      (m): m is HttpModule => 'models' in m || 'controllers' in m || 'middlewares' in m
    );

    const allModels: ModelList = httpModules.flatMap(
      (m) => m.models ?? []
    );
    const allControllers: ControllerConfig[] = httpModules.flatMap(
      (m) => m.controllers ?? []
    );
    const allMiddlewares: Middleware[] = httpModules.flatMap(
      (m) => m.middlewares ?? []
    );

    // Built-in + user modules
    this.modules = [
      new DatabaseModule(),
      ...(config.modules || []),
      new ModelModule(allModels),
      new MiddlewareModule(allMiddlewares),
      new ControllerModule(allControllers),
      new ServerModule(config),
    ];
  }

  /**
   * Factory method to create and initialize an Application instance.
   *
   * @param config Application configuration
   * @returns Initialized Application instance
   */
  static async create(config: AppConfig = {}): Promise<Application> {
    const app = new Application(config);
    await app.init();
    return app;
  }

  /**
   * Initialize all modules:
   * - Validate imports
   * - Register providers (classes, instances, factories)
   * - Run custom registration logic
   * - Validate expected exports
   */
  private async init() {
    for (const module of this.modules) {
      if (module.imports) {
        Object.values(module.imports).forEach((dep) => {
          if (!this.ioc.has(dep)) {
            throw new Error(`Missing dependency: ${String(dep)}`);
          }
        });
      }

      if (module.providers) {
        for (const provider of module.providers) {
          this.registerProvider(provider);
        }
      }

      if (module.register) {
        await module.register(this.ioc, this.config);
      }

      if (module.exports) {
        Object.values(module.exports).forEach((token) => {
          if (!this.ioc.has(token)) {
            throw new Error(
              `Module did not register expected export: ${String(token)}`
            );
          }
        });
      }
    }
  }

  /**
   * Register a provider into the IoC container.
   *
   * Supports three strategies:
   * - useClass
   * - useInstance
   * - useFactory
   */
  private registerProvider<T>(provider: ProviderConfig<T>) {
    if ('useClass' in provider) {
      const binding = this.ioc.bind<T>(provider.provide).to(provider.useClass);
      if (provider.deps) binding.with(provider.deps);
      if (provider.isSingleton) binding.inSingletonScope();
    }

    if ('useInstance' in provider) {
      this.ioc.bind<T>(provider.provide).toInstance(provider.useInstance);
    }

    if ('useFactory' in provider) {
      if (provider.isSingleton) {
        const instance = provider.useFactory(this.ioc);
        this.ioc.bind<T>(provider.provide).toInstance(instance);
      } else {
        this.ioc.toFactory(provider.provide, () =>
          provider.useFactory(this.ioc)
        );
      }
    }
  }

  /**
   * Start listening on a given port using the configured server adapter.
   */
  public listen(port: number, callback: () => void) {
    const server = this.ioc.get<IServerAdapter>(IServerAdapter);
    server.listen(port, callback);
  }

  /**
   * Expose underlying IoC container for advanced use cases.
   */
  public getContainer(): IoCContainer {
    return this.ioc;
  }
}

