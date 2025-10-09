import { Container } from '@kurdel/ioc';
import type { ControllerConfig, Router, MiddlewareRegistry } from '@kurdel/core/http';
import type { AppModule, ProviderConfig } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/app';

import { ControllerResolverImpl } from 'src/http/controller-resolver-impl.js';
import { RouterImpl } from 'src/http/router-impl.js';

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
        useFactory: (ioc: Container) => new ControllerResolverImpl(ioc),
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

