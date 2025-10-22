import type { Container } from '@kurdel/ioc';
import { IoCContainer } from '@kurdel/ioc';
import type { AppConfig, Application, AppModule } from '@kurdel/core/app';
import type { RunningServer, ServerAdapter } from '@kurdel/core/http';
import { TOKENS } from '@kurdel/core/tokens';

import { ModuleLoader } from 'src/app/module-loader.js';
import { LifecycleManager } from 'src/app/lifecycle-manager.js';
import { ServerRunner } from 'src/app/server-runner.js';
import { RuntimeComposer } from 'src/app/runtime-composer.js';

/**
 * kurdel runtime application.
 *
 * Coordinates module initialization, dependency registration,
 * and server lifecycle within a single runtime instance.
 *
 * Responsibilities:
 * - Aggregate declarations from user modules (controllers, middlewares, models)
 * - Compose built-in runtime modules (server/router/middleware/model/database/lifecycle)
 * - Initialize all modules via ModuleLoader and register providers in IoC
 * - Manage application lifecycle (OnStart / OnShutdown)
 * - Start and stop the HTTP server via ServerAdapter (no Node.js types leak)
 *
 * Design notes:
 * - Lives entirely in runtime; consumers interact only through the public Application API
 * - “IoC first”: every dependency is resolved via tokens and interfaces
 * - Request scope creation is delegated to ServerModule (per-request)
 */
export class RuntimeApplication implements Application {
  /** Immutable app configuration passed from the facade. */
  private readonly config: AppConfig;

  /** Root IoC container — central registry for all runtime providers. */
  private readonly ioc = new IoCContainer();

  /** Ordered list of modules to initialize (built-in + user-defined). */
  private readonly modules: AppModule[];

  /** Handles lifecycle hook execution (OnStart / OnShutdown). */
  private readonly lifecycle = new LifecycleManager();

  /** Read-only accessor exposing the underlying IoC container. */
  get container(): Container {
    return this.ioc;
  }

  /**
   * Construct a new runtime application.
   *
   * Steps performed:
   *  - Store runtime configuration
   *  - Compose the module pipeline (built-ins + user modules) via RuntimeComposer
   */
  constructor(config: AppConfig) {
    this.config = config;
    this.modules = RuntimeComposer.compose(config);
  }

  /**
   * Add extra modules programmatically before bootstrap.
   * Useful for integration tests or dynamic composition in code.
   */
  use(...modules: AppModule[]): void {
    this.modules.push(...modules);
  }

  /**
   * Bootstrap the runtime:
   *  - Validate and initialize all modules
   *  - Register declared providers into the IoC container
   *  - Execute each module’s optional `register()` hook
   *
   * Must be called before `listen()`.
   */
  async bootstrap(): Promise<void> {
    const loader = new ModuleLoader(this.ioc);
    await loader.init(this.modules, this.config);
  }

  /**
   * Start the HTTP server via the registered ServerAdapter and return a handle.
   *
   * Lifecycle sequence:
   *  1) Resolve ServerAdapter from IoC
   *  2) Gather OnStart / OnShutdown hooks (LifecycleModule ensures their presence)
   *  3) Delegate to ServerRunner to handle listen/close mechanics
   *
   * Supports both overloads:
   *   - listen(port, callback)
   *   - listen(port, host, callback)
   */
  listen(port: number, hostOrCb?: string | (() => void), cb?: () => void): RunningServer {
    const adapter = this.ioc.get<ServerAdapter>(TOKENS.ServerAdapter);

    const onStart = this.ioc.has(TOKENS.OnStart)
      ? this.ioc.get<(() => Promise<void>)[]>(TOKENS.OnStart)
      : [];

    const onShutdown = this.ioc.has(TOKENS.OnShutdown)
      ? this.ioc.get<(() => Promise<void>)[]>(TOKENS.OnShutdown)
      : [];

    const runner = new ServerRunner(adapter, this.lifecycle);
    return runner.listen(onStart, onShutdown, port, hostOrCb, cb);
  }

  /**
   * Expose the underlying IoC container for advanced scenarios:
   * diagnostics, module introspection, or test overrides.
   *
   * Prefer resolving dependencies via typed tokens in normal app code.
   */
  getContainer(): Container {
    return this.container;
  }
}
