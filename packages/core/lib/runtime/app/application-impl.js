import { IoCContainer } from '@kurdel/ioc';
import { TOKENS } from '../../api/tokens.js';
import { ControllerModule } from '../modules/controller-module.js';
import { DatabaseModule } from '../modules/database-module.js';
import { MiddlewareModule } from '../modules/middleware-module.js';
import { ModelModule } from '../modules/model-module.js';
import { ServerModule } from '../modules/server-module.js';
/**
 * Internal application implementation.
 * Orchestrates module loading, provider registration and server startup.
 */
export class ApplicationImpl {
    /** Expose the container using the public IoC interface. */
    get container() {
        return this.ioc;
    }
    constructor(config) {
        this.config = config;
        this.ioc = new IoCContainer();
        // Aggregate HTTP artifacts from HttpModules
        const httpModules = (config.modules ?? []).filter((m) => 'models' in m || 'controllers' in m || 'middlewares' in m);
        const allModels = httpModules.flatMap((m) => m.models ?? []);
        const allControllers = httpModules.flatMap((m) => m.controllers ?? []);
        const allMiddlewares = httpModules.flatMap((m) => m.middlewares ?? []);
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
    use(...modules) {
        this.modules.push(...modules);
    }
    /** Initialize modules: validate imports/exports and register providers. */
    async init() {
        for (const module of this.modules) {
            // Validate imports
            if (module.imports) {
                for (const dep of Object.values(module.imports)) {
                    if (!this.ioc.has(dep)) {
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
            await module.register?.(this.ioc, this.config);
            // Validate expected exports
            if (module.exports) {
                for (const token of Object.values(module.exports)) {
                    if (!this.ioc.has(token)) {
                        throw new Error(`Module did not register expected export: ${String(token)}`);
                    }
                }
            }
        }
    }
    /** Register a provider using the current IoC container semantics. */
    registerProvider(provider) {
        if ('useClass' in provider) {
            const binding = this.ioc.bind(provider.provide).to(provider.useClass);
            if (provider.deps)
                binding.with(provider.deps);
            if (provider.isSingleton)
                binding.inSingletonScope();
            return;
        }
        if ('useInstance' in provider) {
            this.ioc.bind(provider.provide).toInstance(provider.useInstance);
            return;
        }
        if ('useFactory' in provider) {
            if (provider.isSingleton) {
                const instance = provider.useFactory(this.ioc);
                this.ioc.bind(provider.provide).toInstance(instance);
            }
            else {
                this.ioc.toFactory(provider.provide, () => provider.useFactory(this.ioc));
            }
        }
    }
    /** Start the server using the registered ServerAdapter, and get it. */
    listen(port, callback) {
        const adapter = this.ioc.get(TOKENS.ServerAdapter);
        adapter.listen(port, callback ?? (() => { }));
        // If your Node adapter exposes a raw server, surface it via raw()
        const raw = ('getHttpServer' in adapter)
            ? () => adapter.getHttpServer()
            : undefined;
        const close = async () => {
            if ('close' in adapter && typeof adapter.close === 'function') {
                await adapter.close();
            }
            ;
        };
        return {
            url: typeof adapter.url === 'function'
                ? adapter.url()
                : undefined,
            close,
            raw
        };
    }
    /** Internal bootstrap, called by the factory. */
    async bootstrap() {
        await this.init();
    }
    /**
     * Expose underlying IoC container for advanced use cases.
     */
    getContainer() {
        return this.container;
    }
}
//# sourceMappingURL=application-impl.js.map