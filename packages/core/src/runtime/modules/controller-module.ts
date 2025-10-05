import { Container } from '@kurdel/ioc';

import { ControllerConfig, Router } from 'src/api/http/interfaces.js';
import { AppModule, ProviderConfig } from 'src/api/app/app-module.js';
import { TOKENS } from 'src/api/app/tokens.js';

import { IoCControllerResolver } from '../app/ioc-controller-resolver.js';
import { MiddlewareRegistry } from '../app/middleware-registry.js';
import { RouterImpl } from '../http/router.js';

/**
 * ControllerModule
 *
 * - Registers controllers from all HttpModules
 * - Wires Router with IoCControllerResolver and MiddlewareRegistry
 * - Supports controller-level middlewares and prefix metadata
 */
export class ControllerModule implements AppModule {
  readonly exports = {
    controllerConfigs: TOKENS.ControllerConfigs,
  };

  readonly providers: ProviderConfig[];

  constructor(private controllers: ControllerConfig[]) {
    this.providers = [
      {
        provide: TOKENS.ControllerResolver,
        useFactory: (ioc: Container) => new IoCControllerResolver(ioc),
        isSingleton: true,
      },
      {
        provide: TOKENS.Router,
        useClass: RouterImpl as unknown as new (...a:any[]) => Router,
        isSingleton: true,
        deps: {
          resolver: TOKENS.ControllerResolver,
          controllerConfigs: TOKENS.ControllerConfigs,
          registry: TOKENS.MiddlewareRegistry,
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
    const registry = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry);

    this.controllers.forEach((c) => {
      c.middlewares?.forEach((mw) => registry.useFor(c.use, mw));
    });
  }
}

