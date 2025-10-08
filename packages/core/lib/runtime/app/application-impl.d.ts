import { Container } from '@kurdel/ioc';
import type { RunningServer } from '../../api/http/interfaces.js';
import type { Application } from '../../api/app/application.js';
import type { AppModule } from '../../api/app/app-module.js';
import type { AppConfig } from '../../api/app/config.js';
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
export declare class ApplicationImpl implements Application {
    /** Immutable app configuration passed from the facade. */
    private readonly config;
    /** Root IoC container. Modules register providers here. */
    private readonly ioc;
    /** Linearized list of modules to initialize (built-ins + user-defined). */
    private readonly modules;
    /** Expose the container using the public IoC interface. (read-only accessor) */
    get container(): Container;
    /**
     * Build the application:
     * - Create a root IoC container
     * - Collect HTTP artifacts from user HttpModules
     * - Compose built-in modules together with user modules
     */
    constructor(config: AppConfig);
    /**
     * Allow adding modules programmatically before bootstrap.
     * Useful for tests or advanced composition in code.
     */
    use(...modules: AppModule[]): void;
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
    private init;
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
    private registerProvider;
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
    listen(port: number, hostOrCb?: string | (() => void), cb?: () => void): RunningServer;
    /**
     * Internal bootstrap called by the public factory:
     * ensures modules are initialized, providers registered,
     * and container is ready prior to listen().
     */
    bootstrap(): Promise<void>;
    /**
     * Expose underlying IoC container for advanced scenarios:
     * module introspection, diagnostics, test overrides, etc.
     * Prefer using tokens/contracts in app code; this escape hatch is optional.
     */
    getContainer(): Container;
}
