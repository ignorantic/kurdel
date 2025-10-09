import type { Container} from '@kurdel/ioc';
import { IoCContainer } from '@kurdel/ioc';
import type { ModelList } from '@kurdel/core/db';
import type {
  AppConfig,
  Application,
  AppModule,
  ProviderConfig,
  OnStartHook,
  OnShutdownHook,
} from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/app';
import type {
  ControllerConfig,
  RunningServer,
  ServerAdapter,
  Middleware,
  HttpModule,
} from '@kurdel/core/http';

import { ControllerModule } from '../modules/controller-module.js';
import { DatabaseModule } from '../modules/database-module.js';
import { MiddlewareModule } from '../modules/middleware-module.js';
import { ModelModule } from '../modules/model-module.js';
import { ServerModule } from '../modules/server-module.js';
import { LifecycleModule } from '../modules/lifecycle-module.js';

/**
 * Run lifecycle hooks sequentially with best-effort logging.
 * - If a hook throws, we log (if a logger is provided) and rethrow to fail fast.
 * - The caller decides direction (normal vs reversed order) by the array it passes.
 */
async function runHooks(
  kind: 'start' | 'shutdown',
  hooks: Array<() => void | Promise<void>>,
  logger?: any
) {
  for (const fn of hooks) {
    try {
      await fn();
    } catch (e) {
      try {
        logger?.error?.(`[lifecycle:${kind}]`, e);
      // eslint-disable-next-line no-empty
      } catch {}
      throw e;
    }
  }
}

/**
 * Internal application implementation (runtime).
 *
 * Responsibilities:
 * - Aggregate declarations from user modules (controllers, middlewares, models).
 * - Validate module imports/exports and register providers in the IoC container.
 * - Wire built-in runtime modules (server/router/middleware/model/database/lifecycle).
 * - Start and stop the HTTP server via the ServerAdapter (no Node.js types leak in API).
 *
 * Design notes:
 * - API vs Runtime boundary: this class lives in runtime and depends on runtime modules,
 *   but consumers see only the `Application` API contract.
 * - IoC first: every dependency is looked up via tokens and API interfaces.
 * - Request scope is created in ServerModule (per-request) — not here.
 */
export class RuntimeApplication implements Application {
  /** Immutable app configuration passed from the facade. */
  private readonly config: AppConfig;
  /** Root IoC container. Modules register providers here. */
  private readonly ioc: Container;
  /** Linearized list of modules to initialize (built-ins + user-defined). */
  private readonly modules: AppModule[];

  /** Expose the container using the public IoC interface. (read-only accessor) */
  get container(): Container {
    return this.ioc as unknown as Container;
  }

  /**
   * Build the application:
   * - Create a root IoC container
   * - Collect HTTP artifacts from user HttpModules
   * - Compose built-in modules together with user modules
   */
  constructor(config: AppConfig) {
    this.config = config;
    this.ioc = new IoCContainer();

    // Aggregate HTTP declarations from user-provided modules that implement HttpModule.
    // We keep the API clean: only contracts/types from `api/` are referenced on this side.
    const httpModules = (config.modules ?? []).filter(
      (m): m is HttpModule => 'models' in m || 'controllers' in m || 'middlewares' in m
    );

    const allModels: ModelList = httpModules.flatMap(m => m.models ?? []);
    const allControllers: ControllerConfig[] = httpModules.flatMap(m => m.controllers ?? []);
    const allMiddlewares: Middleware[] = httpModules.flatMap(m => m.middlewares ?? []);

    // Compose module pipeline:
    // 1) LifecycleModule provides OnStart/OnShutdown hook arrays (mutable singletons).
    // 2) DatabaseModule (optional wiring for ORM/DB — internal to kurdel runtime).
    // 3) User modules (may register providers or push lifecycle hooks).
    // 4) Model/Middleware/Controller modules materialize aggregated declarations.
    // 5) ServerModule wires ServerAdapter to Router and sets per-request scope.
    this.modules = [
      new LifecycleModule(),
      new DatabaseModule(),
      ...(config.modules || []),
      new ModelModule(allModels),
      new MiddlewareModule(allMiddlewares),
      new ControllerModule(allControllers),
      new ServerModule(config),
    ];
  }

  /**
   * Allow adding modules programmatically before bootstrap.
   * Useful for tests or advanced composition in code.
   */
  use(...modules: AppModule[]): void {
    this.modules.push(...modules);
  }

  /**
   * Initialize modules in order:
   * - Validate declared imports (fail fast if dependency token is not present).
   * - Register providers (class/value/factory) using the IoC container.
   * - Execute optional custom `register(ioc, config)` hook on the module.
   * - Validate declared exports (ensure provider for each export token exists).
   *
   * This stays synchronous in shape at the top-level (Application.listen calls bootstrap),
   * but individual module actions can be async.
   */
  private async init() {
    for (const module of this.modules) {
      // Check declared imports: the module expects these tokens to be present.
      if (module.imports) {
        for (const dep of Object.values(module.imports)) {
          if (!this.ioc.has(dep)) {
            throw new Error(`Missing dependency: ${String(dep)}`);
          }
        }
      }

      // Register declared providers in the container.
      if (module.providers) {
        for (const provider of module.providers) {
          this.registerProvider(provider);
        }
      }

      // Module-specific hook for custom wiring (optional).
      await module.register?.(this.ioc as unknown as Container, this.config);

      // Ensure module delivered its declared exports (tokens must be bound).
      if (module.exports) {
        for (const token of Object.values(module.exports)) {
          if (!this.ioc.has(token)) {
            throw new Error(`Module did not register expected export: ${String(token)}`);
          }
        }
      }
    }
  }

  /**
   * Register a single provider according to our DI semantics.
   * Supports:
   * - useClass: binds a class and optionally marks the binding singleton.
   * - useInstance: registers a ready-made value (always singleton).
   * - useFactory: either singleton by pre-creating the instance, or transient via toFactory.
   *
   * NOTE: IoC contract is narrow on purpose (DIP). Implementation details (caches, scopes)
   * belong to @kurdel/ioc and should not leak here.
   */
  private registerProvider<T>(provider: ProviderConfig<T>) {
    if ('useClass' in provider) {
      const binding = this.ioc.bind<T>(provider.provide).to(provider.useClass);
      if (provider.deps) binding.with(provider.deps);
      if (provider.isSingleton) binding.inSingletonScope();
      return;
    }

    if ('useInstance' in provider) {
      this.ioc.bind<T>(provider.provide).toInstance(provider.useInstance);
      return;
    }

    if ('useFactory' in provider) {
      if (provider.isSingleton) {
        // Eagerly create and store the instance — deterministic singleton.
        const instance = provider.useFactory(this.ioc);
        this.ioc.bind<T>(provider.provide).toInstance(instance);
      } else {
        // Lazily create on each resolve — each get() calls factory.
        this.ioc.toFactory(provider.provide, () => provider.useFactory(this.ioc));
      }
    }
  }

  /**
   * Start the HTTP server via the registered ServerAdapter and return a handle.
   *
   * Lifecycle:
   * - We derive OnStart/OnShutdown hook arrays from the container (LifecycleModule ensures presence).
   * - When server reports "ready", we run OnStart hooks, then call user callback.
   * - The returned RunningServer exposes:
   *     - raw(): to access underlying server if adapter supports it (Node http.Server, etc.)
   *     - close(): graceful shutdown => adapter.close() then OnShutdown hooks in reverse order.
   *
   * Overloads are honored: listen(port, cb) or listen(port, host, cb).
   */
  listen(port: number, hostOrCb?: string | (() => void), cb?: () => void): RunningServer {
    const adapter = this.ioc.get<ServerAdapter>(TOKENS.ServerAdapter);

    // Obtain lifecycle hook arrays (empty when LifecycleModule is absent — still safe).
    const onStart: OnStartHook[] = this.ioc.has(TOKENS.OnStart) ? this.ioc.get(TOKENS.OnStart) : [];
    const onShutdown: OnShutdownHook[] = this.ioc.has(TOKENS.OnShutdown)
      ? this.ioc.get(TOKENS.OnShutdown)
      : [];

    // Normalize final user callback from overloads.
    const userDone = typeof hostOrCb === 'function' ? hostOrCb : cb;

    // Readiness guard: run hooks first, then invoke user's callback.
    const onReady = () => {
      Promise.resolve()
        .then(() => runHooks('start', onStart /* optional logger */))
        .then(() => {
          try {
            userDone?.();
          // eslint-disable-next-line no-empty
          } catch {}
        });
    };

    // Start the server adapter; we do not leak Node types here.
    if (typeof hostOrCb === 'string') {
      adapter.listen?.(port, hostOrCb, onReady);
    } else {
      adapter.listen?.(port, onReady);
    }

    // Return an opaque handle with raw() and close().
    const running: RunningServer = {
      // Proxy raw() using the adapter contract (e.g., Native adapter returns http.Server)
      raw:
        typeof adapter.raw === 'function'
          ? <T = unknown>() => adapter.raw?.() as T | undefined
          : undefined,

      // Graceful shutdown:
      // 1) stop the adapter (stop accepting new connections, close server)
      // 2) run shutdown hooks in reverse order (LIFO) so paired resources unwind correctly.
      close: async () => {
        try {
          await Promise.resolve(adapter.close?.());
        } finally {
          await runHooks('shutdown', [...onShutdown].reverse() /* optional logger */);
        }
      },
    };

    return running;
  }

  /**
   * Internal bootstrap called by the public factory:
   * ensures modules are initialized, providers registered,
   * and container is ready prior to listen().
   */
  async bootstrap(): Promise<void> {
    await this.init();
  }

  /**
   * Expose underlying IoC container for advanced scenarios:
   * module introspection, diagnostics, test overrides, etc.
   * Prefer using tokens/contracts in app code; this escape hatch is optional.
   */
  public getContainer(): Container {
    return this.container;
  }
}
