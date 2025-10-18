import type { Container } from '@kurdel/ioc';
import type { ControllerConfig, Router, MiddlewareRegistry } from '@kurdel/core/http';
import type { AppModule, ProviderConfig } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/app';

import { RuntimeControllerResolver } from 'src/http/runtime-controller-resolver.js';
import { RuntimeRouter } from 'src/http/runtime-router.js';

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
        useFactory: (ioc: Container) => new RuntimeControllerResolver(ioc),
        singleton: true,
      },
      {
        provide: TOKENS.Router,
        useClass: RuntimeRouter as unknown as new (...a: any[]) => Router,
        singleton: true,
        deps: {
          resolver: TOKENS.ControllerResolver,
          controllerConfigs: TOKENS.ControllerConfigs,
        },
      },
      ...controllers.map(c => ({
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

    this.controllers.forEach(c => {
      c.middlewares?.forEach(mw => registry.useFor(c.use, mw));
    });
  }
}
