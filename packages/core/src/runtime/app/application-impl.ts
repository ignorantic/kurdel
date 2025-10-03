import { IoCContainer } from '@kurdel/ioc';

import type { Application } from 'src/api/app/application.js';
import type { AppModule, ProviderConfig } from 'src/api/app-module.js';
import type { AppConfig } from 'src/api/config.js';
import type { HttpModule } from 'src/api/http-module.js';
import {
  ControllerConfig,
  ModelList,
  RunningServer,
  ServerAdapter,
} from 'src/api/interfaces.js';
import { TOKENS } from 'src/api/tokens.js';
import type { Middleware } from 'src/api/types.js';

import { ControllerModule } from '../modules/controller-module.js';
import { DatabaseModule } from '../modules/database-module.js';
import { MiddlewareModule } from '../modules/middleware-module.js';
import { ModelModule } from '../modules/model-module.js';
import { ServerModule } from '../modules/server-module.js';

/**
 * Internal application implementation.
 * Orchestrates module loading, provider registration and server startup.
 */
export class ApplicationImpl implements Application {
  private readonly config: AppConfig;
  private readonly iocImpl: IoCContainer;
  private readonly modules: AppModule[];

  /** Expose the container using the public IoC interface. */
  get container(): IoCContainer {
    return this.iocImpl as unknown as IoCContainer;
  }

  constructor(config: AppConfig) {
    this.config = config;
    this.iocImpl = new IoCContainer();

    // Aggregate HTTP artifacts from HttpModules
    const httpModules = (config.modules ?? []).filter(
      (m): m is HttpModule => 'models' in m || 'controllers' in m || 'middlewares' in m
    );

    const allModels: ModelList = httpModules.flatMap((m) => m.models ?? []);
    const allControllers: ControllerConfig[] = httpModules.flatMap((m) => m.controllers ?? []);
    const allMiddlewares: Middleware[] = httpModules.flatMap((m) => m.middlewares ?? []);

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

  /** Allow adding modules programmatically before bootstrap. */
  use(...modules: AppModule[]): void {
    this.modules.push(...modules);
  }

  /** Initialize modules: validate imports/exports and register providers. */
  private async init() {
    for (const module of this.modules) {
      // Validate imports
      if (module.imports) {
        for (const dep of Object.values(module.imports)) {
          if (!this.iocImpl.has(dep)) {
            throw new Error(`Missing dependency: ${String(dep)}`);
          }
        }
      }

      // Register providers
      if (module.providers) {
        for (const provider of module.providers) {
          this.registerProvider(provider);
        }
      }

      // Custom module hook
      await module.register?.(this.iocImpl as unknown as IoCContainer, this.config);

      // Validate expected exports
      if (module.exports) {
        for (const token of Object.values(module.exports)) {
          if (!this.iocImpl.has(token)) {
            throw new Error(`Module did not register expected export: ${String(token)}`);
          }
        }
      }
    }
  }

  /** Register a provider using the current IoC container semantics. */
  private registerProvider<T>(provider: ProviderConfig<T>) {
    if ('useClass' in provider) {
      const binding = this.iocImpl.bind<T>(provider.provide).to(provider.useClass);
      if (provider.deps) binding.with(provider.deps);
      if (provider.isSingleton) binding.inSingletonScope();
      return;
    }

    if ('useInstance' in provider) {
      this.iocImpl.bind<T>(provider.provide).toInstance(provider.useInstance);
      return;
    }

    if ('useFactory' in provider) {
      if (provider.isSingleton) {
        const instance = provider.useFactory(this.iocImpl);
        this.iocImpl.bind<T>(provider.provide).toInstance(instance);
      } else {
        this.iocImpl.toFactory(provider.provide, () => provider.useFactory(this.iocImpl));
      }
    }
  }

  /** Start the server using the registered ServerAdapter, and get it. */
  listen(port: number, callback?: () => void): RunningServer {
    const adapter = this.iocImpl.get<ServerAdapter>(TOKENS.ServerAdapter);
    adapter.listen(port, callback ?? (() => {}));

    // If your Node adapter exposes a raw server, surface it via raw()
    const raw = ('getHttpServer' in (adapter as any))
      ? () => (adapter as any).getHttpServer()
      : undefined;

    const close = async () => {
      if ('close' in adapter && typeof (adapter as any).close === 'function') {
        await (adapter as any).close();
      };
    };

    return {
      url: typeof (adapter as any).url === 'function'
        ? (adapter as any).url()
        : undefined,
      close,
      raw
    };
  }

  /** Internal bootstrap, called by the factory. */
  async bootstrap(): Promise<void> {
    await this.init();
  }

  /**
   * Expose underlying IoC container for advanced use cases.
   */
  public getContainer(): IoCContainer {
    return this.container;
  }
}

