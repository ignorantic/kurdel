import type { Newable } from '@kurdel/common';
import { IoCContainer } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from './app-module.js';
import { IoCControllerResolver } from '../ioc-controller-resolver.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Router } from '../router.js';
import { Controller } from '../controller.js';
import { ControllerConfig } from '../http/interfaces.js';

export const CONTROLLER_CLASSES = Symbol('CONTROLLER_CLASSES');

/**
 * ControllerModule
 *
 * - Registers controllers from all HttpModules
 * - Wires Router with IoCControllerResolver and MiddlewareRegistry
 * - Supports controller-level middlewares and prefix metadata
 */
export class ControllerModule implements AppModule {
  readonly imports = { registry: MiddlewareRegistry };
  readonly exports = {
    controllers: CONTROLLER_CLASSES,
    router: Router,
  };

  readonly providers: ProviderConfig[];

  constructor(private controllers: ControllerConfig[]) {
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
      ...controllers.map((c) => ({
        provide: c.use,
        useClass: c.use,
        deps: c.deps,
      })),
      {
        provide: CONTROLLER_CLASSES,
        useInstance: controllers.map(
          (c) => c.use as Newable<Controller<any>>
        ),
      },
    ];
  }

  async register(ioc: IoCContainer): Promise<void> {
    const registry = ioc.get(MiddlewareRegistry);

    this.controllers.forEach((c) => {
      c.middlewares?.forEach((mw) => registry.useFor(c.use, mw));
    });
  }
}

