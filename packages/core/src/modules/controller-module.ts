import { IoCContainer } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from './app-module.js';
import { IoCControllerResolver } from '../ioc-controller-resolver.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Router } from '../router.js';
import { ControllerConfig } from '../http/interfaces.js';

export const CONTROLLER_CONFIGS = Symbol('CONTROLLER_CONFIGS');

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
    controllerConfigs: CONTROLLER_CONFIGS,
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
          controllerConfigs: CONTROLLER_CONFIGS,
          registry: MiddlewareRegistry,
        },
      },
      ...controllers.map((c) => ({
        provide: c.use,
        useClass: c.use,
        deps: c.deps,
      })),
      {
        provide: CONTROLLER_CONFIGS,
        useInstance: controllers,
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

