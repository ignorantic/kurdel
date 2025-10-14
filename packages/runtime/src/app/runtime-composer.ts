import type { AppConfig, AppModule } from '@kurdel/core/app';
import type { HttpModule, ControllerConfig, Middleware } from '@kurdel/core/http';
import type { ModelList } from '@kurdel/core/db';

import { LifecycleModule } from 'src/modules/lifecycle-module.js';
import { DatabaseModule } from 'src/modules/database-module.js';
import { ModelModule } from 'src/modules/model-module.js';
import { MiddlewareModule } from 'src/modules/middleware-module.js';
import { ControllerModule } from 'src/modules/controller-module.js';
import { ServerModule } from 'src/modules/server-module.js';

/**
 * Composes the full runtime module pipeline for a Kurdel application.
 *
 * Responsibilities:
 * - Collect HTTP declarations (models, controllers, middlewares) from user-defined HttpModules.
 * - Assemble built-in framework modules in the correct order.
 * - Return a flat list of AppModules ready for initialization by the ModuleLoader.
 *
 * Default pipeline:
 *   1. LifecycleModule   → provides OnStart / OnShutdown hooks
 *   2. DatabaseModule    → internal DB abstractions (optional wiring)
 *   3. User modules      → may register custom providers or hooks
 *   4. ModelModule       → registers collected model definitions
 *   5. MiddlewareModule  → registers collected middlewares
 *   6. ControllerModule  → registers collected controllers
 *   7. ServerModule      → wires ServerAdapter to router and request scope
 *
 * Design notes:
 * - Composition is static and deterministic (no dynamic discovery at runtime).
 * - All user modules are preserved between DatabaseModule and ModelModule.
 * - Intended to keep RuntimeApplication constructor minimal and declarative.
 */
export class RuntimeComposer {
  /**
   * Compose the complete runtime module list for the given configuration.
   *
   * @param config - The application configuration object.
   * @returns Ordered list of built-in and user-defined modules.
   */
  static compose(config: AppConfig): AppModule[] {
    // Extract only user modules that expose HTTP artifacts (controllers, models, middlewares)
    const httpModules = (config.modules ?? []).filter(
      (m): m is HttpModule =>
        'models' in m || 'controllers' in m || 'middlewares' in m
    );

    // Aggregate HTTP declarations from user HttpModules
    const allModels: ModelList = httpModules.flatMap(m => m.models ?? []);
    const allControllers: ControllerConfig[] = httpModules.flatMap(m => m.controllers ?? []);
    const allMiddlewares: Middleware[] = httpModules.flatMap(m => m.middlewares ?? []);

    // Compose pipeline in deterministic order
    return [
      new LifecycleModule(),
      new DatabaseModule(),
      ...(config.modules ?? []),
      new ModelModule(allModels),
      new MiddlewareModule(allMiddlewares),
      new ControllerModule(allControllers),
      new ServerModule(config),
    ];
  }
}
