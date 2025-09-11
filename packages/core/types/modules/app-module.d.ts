import { Identifier, IoCContainer } from '@kurdel/ioc';
import { AppConfig } from '../config.js';
/**
 * AppModule
 *
 * A generic contract for all application modules.
 * Defines what a module requires (imports) and what it provides (exports).
 * Used by the Application to orchestrate initialization and dependency wiring.
 */
export interface AppModule {
    /**
     * Imports: dependencies that this module requires
     * to be present in the IoC container before its initialization.
     *
     * Example: ModelModule imports IDatabase.
     */
    imports?: Record<string, Identifier>;
    /**
     * Exports: bindings that this module registers into the IoC container
     * and makes available for other modules.
     *
     * Example: DatabaseModule exports IDatabase.
     */
    exports?: Record<string, Identifier>;
    /**
     * Entry point of the module.
     * Called by the Application during startup.
     * Responsible for registering classes, services, models,
     * or controllers into the IoC container.
     */
    register(ioc: IoCContainer, config: AppConfig): Promise<void> | void;
}
//# sourceMappingURL=app-module.d.ts.map