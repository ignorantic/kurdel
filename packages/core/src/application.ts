import { IoCContainer } from '@kurdel/ioc';
import type { AppConfig } from './config.js';
import type { AppModule, ProviderConfig } from './modules/app-module.js';
import { DatabaseModule } from './modules/database-module.js';
import { ServiceModule } from './modules/service-module.js';
import { ModelModule } from './modules/model-module.js';
import { MiddlewareModule } from './modules/middleware-module.js';
import { ControllerModule } from './modules/controller-module.js';
import { ServerModule } from './modules/server-module.js';
import { IServerAdapter } from './http/interfaces.js';

/**
 * Application
 *
 * Central orchestrator of the framework. Responsible for:
 * - Bootstrapping IoC container
 * - Executing built-in and user-defined modules
 * - Registering providers (useClass, useInstance, useFactory)
 * - Validating imports/exports between modules
 */
export class Application {
  /** Application configuration object */
  private readonly config: AppConfig;

  /** Underlying IoC container */
  private readonly ioc: IoCContainer;

  /** List of all modules (built-in + custom from config) */
  private readonly modules: AppModule[];

  constructor(config: AppConfig) {
    this.config = config;
    this.ioc = new IoCContainer();

    // Built-in modules
    this.modules = [
      new DatabaseModule(),
      new ServiceModule(),
      new ModelModule(),
      new MiddlewareModule(),
      new ControllerModule(config),
      new ServerModule(config),
      ...(config.modules || []), // Allow custom modules
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
   * - Validate required imports
   * - Register providers (classes, instances, factories)
   * - Run optional custom module logic
   * - Validate expected exports
   */
  private async init() {
    for (const module of this.modules) {
      // 1. Validate imports
      if (module.imports) {
        Object.values(module.imports).forEach((dep) => {
          if (!this.ioc.has(dep)) {
            throw new Error(`Missing dependency: ${String(dep)}`);
          }
        });
      }

      // 2. Register providers
      if (module.providers) {
        for (const provider of module.providers) {
          this.registerProvider(provider);
        }
      }

      // 3. Run custom registration logic (if provided)
      if (module.register) {
        await module.register(this.ioc, this.config);
      }

      // 4. Validate exports
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
   * - useClass: binds a class (optionally with dependencies and singleton scope)
   * - useInstance: binds an existing instance
   * - useFactory: binds a factory function (singleton or transient)
   *
   * @param provider Provider configuration object
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
      const instance = provider.useFactory(this.ioc);
      if (provider.isSingleton) {
        this.ioc.bind<T>(provider.provide).toInstance(instance);
      } else {
        this.ioc.toFactory(provider.provide, () => provider.useFactory(this.ioc));
      }
    }
  }

 /**
   * Register a provider into the IoC container.
   *
   * Supports three strategies:
   * - useClass: binds a class (optionally with dependencies and singleton scope)
   * - useInstance: binds an existing instance
   * - useFactory: binds a factory function (singleton or transient)
   *
   * @param provider Provider configuration object
   */
  public listen(port: number, callback: () => void) {
    const server = this.ioc.get<IServerAdapter>(IServerAdapter);
    server.listen(port, callback);
  }

  /**
   * Expose underlying IoC container
   *
   * Useful for:
   * - Unit tests
   * - Advanced dependency management
   * - Manual resolution of services
   *
   * @returns IoCContainer instance
   */
  public getContainer(): IoCContainer {
    return this.ioc;
  }
}
