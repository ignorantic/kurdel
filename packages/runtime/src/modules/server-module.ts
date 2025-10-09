import type { Container } from '@kurdel/ioc';
import { TOKENS } from '@kurdel/core/app';
import type { AppConfig, AppModule, ProviderConfig } from '@kurdel/core/app';
import type {
  Method,
  ControllerConfig,
  RequestLike,
  ResponseLike,
  ServerAdapter,
  Router,
  MiddlewareRegistry,
} from '@kurdel/core/http';

import { NativeHttpServerAdapter } from 'src/http/adapters/native-http-server-adapter.js';

/**
 * ServerModule: wires the HTTP ServerAdapter to the Router.
 *
 * - Provides a singleton ServerAdapter implementation
 * - Injects the root Container and the Router into the adapter
 * - No global state; request-scope is created inside the adapter per request-scope
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
    const router = ioc.get<Router>(TOKENS.Router);

    const registry = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry);
    const controllerConfigs = ioc.get<ControllerConfig[]>(TOKENS.ControllerConfigs);

    router.init({
      resolver: ioc.get(TOKENS.ControllerResolver),
      controllerConfigs,
      middlewares: registry.all(),
    });

    adapter.on(async (req, res) => {
      const scope = ioc.createScope?.() ?? ioc;

      (req as any).__ioc = scope;

      const method = (req.method as Method) ?? 'GET';
      const url = req.url ?? '/';

      const handler = router.resolve(method, url, scope);
      if (!handler) {
        if (typeof res.statusCode === 'number') (res as any).statusCode = 404;
        (res as any).end?.();
        return;
      }

      await Promise.resolve(handler(req, res));
    });
  }
}
