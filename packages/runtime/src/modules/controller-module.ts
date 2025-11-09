import type { Container } from '@kurdel/ioc';
import type {
  ControllerConfig,
  Router,
  MiddlewareRegistry,
  ControllerResolver,
  MiddlewareRegistration,
} from '@kurdel/core/http';
import type { AppModule, ProviderConfig } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';

import { RuntimeControllerResolver } from 'src/http/runtime-controller-resolver.js';
import { RuntimeRouter } from 'src/http/runtime-router.js';
import { ensureTemplateEngineBinding } from 'src/template/ensure-template-engine-binding.js';

/**
 * ## ControllerModule
 *
 * Responsible for:
 * - Registering all controller providers in the IoC container.
 * - Instantiating and initializing the `RuntimeRouter`.
 * - Binding declared middlewares to the `MiddlewareRegistry`.
 */
export class ControllerModule implements AppModule {
  readonly exports = {
    controllerConfigs: TOKENS.ControllerConfigs,
  };

  readonly providers: ProviderConfig[];

  constructor(private readonly controllers: ControllerConfig[]) {
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
      },
      ...controllers.map(c => ({
        provide: c.use,
        useClass: c.use,
        deps: {
          ...c.deps,
          view: TOKENS.TemplateEngineToken,
        },
      })),
      {
        provide: TOKENS.ControllerConfigs,
        useInstance: controllers,
      },
    ];
  }

  /**
   * Initializes router and middleware registry after IoC bootstrap.
   */
  async register(ioc: Container): Promise<void> {
    // Ensure that a template engine is bound before controller creation.
    ensureTemplateEngineBinding(ioc);

    const resolver = ioc.get<ControllerResolver>(TOKENS.ControllerResolver);
    const router = ioc.get<RuntimeRouter>(TOKENS.Router);
    const registry = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry);
    const configs = ioc.get<ControllerConfig[]>(TOKENS.ControllerConfigs);

    // Initialize router (build route table)
    router.init(resolver, configs);

    // Register controller-scoped middlewares
    for (const cfg of this.controllers) {
      for (const entry of cfg.middlewares ?? []) {
        const reg: MiddlewareRegistration =
          typeof entry === 'function'
            ? { use: entry, zone: 'pre', priority: 0 }
            : {
                use: entry.use,
                zone: entry.zone ?? 'pre',
                priority: entry.priority ?? 0,
                action: entry.action,
              };

        registry.useFor(cfg.use, reg.use, {
          zone: reg.zone,
          priority: reg.priority,
          action: reg.action,
        });
      }
    }
  }
}
