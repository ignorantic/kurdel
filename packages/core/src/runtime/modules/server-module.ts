import { Container } from '@kurdel/ioc';

import { Method } from 'src/api/http/types.js';
import {
  ControllerConfig,
  RequestLike,
  ResponseLike,
  ServerAdapter,
} from 'src/api/http/interfaces.js';
import { TOKENS } from 'src/api/app/tokens.js';
import { AppModule, ProviderConfig } from 'src/api/app/app-module.js';
import { NativeHttpServerAdapter } from 'src/runtime/http/adapters/native-http-server-adapter.js';
import { AppConfig } from 'src/api/app/config.js';

import { Router } from 'src/api/http/router.js';
import { MiddlewareRegistry } from 'src/api/http/middleware-registry.js';

/**
 * ServerModule
 *
 * - Provides HTTP ServerAdapter implementation
 * - Wires adapter with Router via adapter.on(handler)
 * - Initializes Router with controller configs and middlewares
 */
export class ServerModule implements AppModule<AppConfig> {
  readonly imports = {
    router: TOKENS.Router,
    registry: TOKENS.MiddlewareRegistry,
    controllerConfigs: TOKENS.ControllerConfigs,
    controllerResolver: TOKENS.ControllerResolver,
  };
  readonly exports = { server: TOKENS.ServerAdapter };

  readonly providers: ProviderConfig[];

  constructor(config: AppConfig) {
    const { server = NativeHttpServerAdapter } = config;

    this.providers = [
      {
        provide: TOKENS.ServerAdapter,
        useClass: server,
        isSingleton: true,
      },
    ];
  }

  async register(ioc: Container): Promise<void> {
    const adapter = ioc.get<ServerAdapter<RequestLike, ResponseLike>>(TOKENS.ServerAdapter);
    const router  = ioc.get<Router>(TOKENS.Router);

    const registry = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry);
    const controllerConfigs = ioc.get<ControllerConfig[]>(TOKENS.ControllerConfigs);

    router.init({
      resolver: ioc.get(TOKENS.ControllerResolver),
      controllerConfigs,
      middlewares: registry.all()
    });

    adapter.on(async (req, res) => {
      const method = (req.method as Method) ?? 'GET';
      const url    = req.url ?? '/';

      const handler = router.resolve(method, url);
      if (!handler) {
        if (typeof res.statusCode === 'number') (res as any).statusCode = 404;
        (res as any).end?.();
        return;
      }

      await Promise.resolve(handler(req, res));
    });
  }
}
