import type { Newable } from '@kurdel/common';
import { IoCContainer } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from './app-module.js';
import { IoCControllerResolver } from '../ioc-controller-resolver.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Router } from '../router.js';
import { Controller } from '../controller.js';
import { AppConfig, CONTROLLER_CLASSES } from '../config.js';

/**
 * ControllerModule
 *
 * - Registers controllers from AppConfig
 * - Wires Router with IoCControllerResolver and MiddlewareRegistry
 * - Exports Router and CONTROLLER_CLASSES
 */
export class ControllerModule implements AppModule<AppConfig> {
  readonly imports = { registry: MiddlewareRegistry };
  readonly exports = {
    controllers: CONTROLLER_CLASSES,
    router: Router,
  };

  readonly providers: ProviderConfig[];

  constructor(config: AppConfig) {
    const { controllers = [] } = config;

    this.providers = [
      {
        provide: IoCControllerResolver,
        useFactory: (ioc: IoCContainer) => new IoCControllerResolver(ioc),
        isSingleton: true,
      },
      {
        provide: Router,
        useClass: Router,
        deps: {
          resolver: IoCControllerResolver,
          controllers: CONTROLLER_CLASSES,
          registry: MiddlewareRegistry,
        },
      },
      ...controllers.map(({ use, deps, middlewares }) => ({
        provide: use,
        useClass: use,
        deps,
      })),
      {
        provide: CONTROLLER_CLASSES,
        useInstance: controllers.map((c) => c.use as Newable<Controller<any>>),
      },
    ];

    this.register = async (ioc: IoCContainer) => {
      const registry = ioc.get(MiddlewareRegistry);
      controllers.forEach(({ use, middlewares }) => {
        middlewares?.forEach((mw) => registry.useFor(use, mw));
      });
    };
  }

  async register(_ioc: IoCContainer): Promise<void> {
    // No-op (everything in providers)
  }
}
