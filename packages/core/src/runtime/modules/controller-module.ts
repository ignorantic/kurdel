import { Container } from '@kurdel/ioc';

import { AppModule, ProviderConfig } from 'src/api/app-module.js';
import { IoCControllerResolver } from 'src/runtime/ioc-controller-resolver.js';
import { MiddlewareRegistry } from 'src/runtime/middleware-registry.js';
import { Router } from 'src/runtime/router.js';
import { ControllerConfig } from 'src/api/interfaces.js';
import { TOKENS } from 'src/api/tokens.js';

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
    controllerConfigs: TOKENS.ControllerConfigs,
    router: Router,
  };

  readonly providers: ProviderConfig[];

  constructor(private controllers: ControllerConfig[]) {
    this.providers = [
      {
        provide: IoCControllerResolver,
        useFactory: (ioc: Container) => new IoCControllerResolver(ioc),
        isSingleton: true,
      },
      {
        provide: Router,
        useClass: Router,
        deps: {
          resolver: IoCControllerResolver,
          controllerConfigs: TOKENS.ControllerConfigs,
          registry: MiddlewareRegistry,
        },
      },
      ...controllers.map((c) => ({
        provide: c.use,
        useClass: c.use,
        deps: c.deps,
      })),
      {
        provide: TOKENS.ControllerConfigs,
        useInstance: controllers,
      },
    ];
  }

  async register(ioc: Container): Promise<void> {
    const registry = ioc.get(MiddlewareRegistry);

    this.controllers.forEach((c) => {
      c.middlewares?.forEach((mw) => registry.useFor(c.use, mw));
    });
  }
}

