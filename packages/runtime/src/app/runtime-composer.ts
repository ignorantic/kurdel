import type { AppConfig, AppModule } from '@kurdel/core/app';
import type {
  HttpModule,
  ControllerConfig,
  MiddlewareRegistration,
  Middleware,
} from '@kurdel/core/http';
import type { Identifier } from '@kurdel/ioc';
import type { ModelList } from '@kurdel/core/db';

import { LifecycleModule } from 'src/modules/lifecycle-module.js';
import { DatabaseModule } from 'src/modules/database-module.js';
import { ModelModule } from 'src/modules/model-module.js';
import { MiddlewareModule } from 'src/modules/middleware-module.js';
import { ControllerModule } from 'src/modules/controller-module.js';
import { ServerModule } from 'src/modules/server-module.js';
import { ModulePriority } from 'src/app/module-priority.js';
import { ModuleValidationError } from 'src/app/errors/module-validation-error.js';

/**
 * ## RuntimeComposer
 *
 * Builds the deterministic runtime module chain for a Kurdel application.
 * Responsible for aggregating user-defined HTTP modules and assembling
 * framework modules in a well-defined initialization order.
 */
export class RuntimeComposer {
  /** Default priority map for built-in modules. */
  private static readonly DEFAULT_PRIORITIES = new Map<string, number>([
    ['LifecycleModule', ModulePriority.Lifecycle],
    ['DatabaseModule', ModulePriority.Database],
    ['ModelModule', ModulePriority.Model],
    ['MiddlewareModule', ModulePriority.Middleware],
    ['ControllerModule', ModulePriority.Controller],
    ['ServerModule', ModulePriority.Server],
  ]);

  /**
   * Main composition entrypoint.
   * @returns Ordered list of AppModules ready for initialization.
   */
  static compose(config: AppConfig): AppModule[] {
    const modules = config.modules ?? [];

    const httpModules = this.extractHttpModules(modules);
    const { models, controllers, middlewares } = this.collectHttpArtifacts(httpModules);

    const unsorted: AppModule[] = [
      new LifecycleModule(),
      new DatabaseModule(),
      ...modules,
      new ModelModule(models),
      new MiddlewareModule(middlewares),
      new ControllerModule(controllers),
      new ServerModule(),
    ];

    const pipeline = this.sortByPriority(unsorted);
    this.validateUniqueProviders(pipeline);

    return pipeline;
  }

  // ------------------------------------------------------------
  // Extraction helpers
  // ------------------------------------------------------------

  /** Selects only modules exposing HTTP artifacts. */
  private static extractHttpModules(modules: AppModule[]): HttpModule[] {
    return modules.filter(
      (m): m is HttpModule => 'models' in m || 'controllers' in m || 'middlewares' in m
    );
  }

  /** Aggregates HTTP declarations across all HttpModules. */
  private static collectHttpArtifacts(httpModules: HttpModule[]) {
    const models: ModelList = httpModules.flatMap(m => m.models ?? []);
    const controllers: ControllerConfig[] = httpModules.flatMap(m => m.controllers ?? []);

    const middlewares: MiddlewareRegistration[] = httpModules.flatMap(m =>
      (m.middlewares ?? []).map((mw: Middleware | MiddlewareRegistration) =>
        typeof mw === 'function'
          ? { use: mw, zone: 'pre', priority: 0 }
          : {
              use: mw.use,
              zone: mw.zone ?? 'pre',
              priority: mw.priority ?? 0,
              action: mw.action,
            }
      )
    );

    return { models, controllers, middlewares };
  }

  // ------------------------------------------------------------
  // Sorting and validation
  // ------------------------------------------------------------

  /** Sorts modules deterministically by priority. */
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

  /** Ensures that no two modules register the same provider token. */
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
