import type { AppConfig, AppModule } from '@kurdel/core/app';
import type { HttpModule, ControllerConfig, Middleware } from '@kurdel/core/http';
import type { Identifier } from '@kurdel/ioc';
import type { ModelList } from '@kurdel/core/db';

import { LifecycleModule } from 'src/modules/lifecycle-module.js';
import { DatabaseModule } from 'src/modules/database-module.js';
import { ModelModule } from 'src/modules/model-module.js';
import { MiddlewareModule } from 'src/modules/middleware-module.js';
import { ControllerModule } from 'src/modules/controller-module.js';
import { ServerModule } from 'src/modules/server-module.js';
import { ModulePriority } from 'src/app/module-priority.js';

export class ModuleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModuleValidationError';
  }
}

/**
 * Builds the complete runtime module chain for a Kurdel application.
 *
 * ## Responsibilities
 * - Collects all HTTP declarations (models, controllers, middlewares)
 *   from user-defined {@link HttpModule}s.
 * - Assembles built-in framework modules in a deterministic order.
 * - Performs validation of provider uniqueness across all modules
 *   via {@link RuntimeComposer.validateUniqueProviders}.
 * - Returns a flat, fully ordered list of {@link AppModule}s ready for
 *   initialization by the {@link ModuleLoader}.
 *
 * ## Default composition order
 *  1. LifecycleModule   → provides OnStart / OnShutdown hooks
 *  2. DatabaseModule    → internal DB abstractions (optional wiring)
 *  3. User modules      → may register custom providers or hooks
 *  4. ModelModule       → registers collected model definitions
 *  5. MiddlewareModule  → registers collected middlewares
 *  6. ControllerModule  → registers collected controllers
 *  7. ServerModule      → wires ServerAdapter to router and request scope
 *
 * ## Design notes
 * - Composition is **static and deterministic** — no runtime discovery or reflection.
 * - User modules that expose HTTP artifacts (`HttpModule`) are still kept
 *   in the pipeline to preserve their own providers or lifecycle hooks.
 * - All provider registrations are checked for **unique token ownership**.
 */
export class RuntimeComposer {
  /**
   * Default priority map for built-in modules.
   * Lower = initialized earlier.
   */
  private static readonly DEFAULT_PRIORITIES = new Map<string, number>([
    ['LifecycleModule', ModulePriority.Lifecycle],
    ['DatabaseModule', ModulePriority.Database],
    ['ModelModule', ModulePriority.Model],
    ['MiddlewareModule', ModulePriority.Middleware],
    ['ControllerModule', ModulePriority.Controller],
    ['ServerModule', ModulePriority.Server],
  ]);

  /**
   * Composes the ordered module pipeline for a given {@link AppConfig}.
   *
   * @param config - Application configuration including user modules.
   * @returns Ordered list of {@link AppModule} instances to initialize.
   *
   * @throws {ModuleValidationError}
   * Thrown if multiple modules register providers for the same token.
   */
  static compose(config: AppConfig): AppModule[] {
    const modules = config.modules ?? [];

    // Extract HttpModules that declare HTTP-related artifacts
    const httpModules = modules.filter(
      (m): m is HttpModule =>
        'models' in m || 'controllers' in m || 'middlewares' in m
    );

    // Aggregate HTTP declarations
    const allModels: ModelList = httpModules.flatMap(m => m.models ?? []);
    const allControllers: ControllerConfig[] = httpModules.flatMap(
      m => m.controllers ?? []
    );
    const allMiddlewares: Middleware[] = httpModules.flatMap(
      m => m.middlewares ?? []
    );

    // Deterministic module pipeline
    const unsorted: AppModule[] = [
      new LifecycleModule(),
      new DatabaseModule(),
      ...modules,
      new ModelModule(allModels),
      new MiddlewareModule(allMiddlewares),
      new ControllerModule(allControllers),
      new ServerModule(config),
    ];

    // Sort deterministically by priority + index
    const pipeline = RuntimeComposer.sortByPriority(unsorted);

    // Validate token uniqueness before container build
    this.validateUniqueProviders(pipeline);

    return pipeline;
  }

  /**
   * Deterministically sorts modules by priority.
   */
  private static sortByPriority(modules: AppModule[]): AppModule[] {
    return modules
      .map((m, index) => ({
        mod: m,
        order: index,
        prio:
          m.priority ??
          RuntimeComposer.DEFAULT_PRIORITIES.get(m.constructor.name) ??
          ModulePriority.User,
      }))
      .sort((a, b) => (a.prio === b.prio ? a.order - b.order : a.prio - b.prio))
      .map(e => e.mod);
  }

  /**
   * Ensures that no two modules register the same provider token.
   *
   * @param modules - List of all modules in the pipeline.
   * @throws {ModuleValidationError}
   * Thrown when duplicate token ownership is detected.
   */
  private static validateUniqueProviders(modules: AppModule[]): void {
    const tokenToModule = new Map<Identifier<any>, string>();

    for (const mod of modules) {
      const moduleName = mod.constructor?.name ?? 'AnonymousModule';

      for (const provider of mod.providers ?? []) {
        const token = provider.provide;
        const owner = tokenToModule.get(token);

        if (owner) {
          throw new ModuleValidationError(
            `Duplicate provider for token "${String(token)}" between modules "${owner}" and "${moduleName}".`
          );
        }

        tokenToModule.set(token, moduleName);
      }
    }
  }
}
