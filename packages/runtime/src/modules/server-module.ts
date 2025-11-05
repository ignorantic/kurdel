import type { Container } from '@kurdel/ioc';
import type { AppConfig, AppModule } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';
import type {
  ServerAdapter,
  Router,
  ControllerConfig,
  MiddlewareRegistry,
  ControllerResolver,
  Method,
  ResponseRenderer,
} from '@kurdel/core/http';

import { NoopResponseRenderer } from 'src/http/noop-response-renderer.js';

/**
 * ServerModule: wires the HTTP ServerAdapter to the Router.
 *
 * Responsibilities:
 * - Provides a platform-agnostic ServerAdapter (injected via AppConfig)
 * - Initializes Router with all controllers and middlewares
 * - Delegates actual HTTP handling to the adapter (no Node/Bun specifics here)
 */
export class ServerModule implements AppModule<AppConfig> {
  readonly imports = {
    router: TOKENS.Router,
    registry: TOKENS.MiddlewareRegistry,
    controllerConfigs: TOKENS.ControllerConfigs,
    controllerResolver: TOKENS.ControllerResolver,
    server: TOKENS.ServerAdapter,
  };

  readonly exports = {
    server: TOKENS.ServerAdapter,
  };

  async register(ioc: Container): Promise<void> {
    const adapter = ioc.get<ServerAdapter>(TOKENS.ServerAdapter);
    const router = ioc.get<Router>(TOKENS.Router);
    const registry = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry);
    const controllerConfigs = ioc.get<ControllerConfig[]>(TOKENS.ControllerConfigs);
    const resolver = ioc.get<ControllerResolver>(TOKENS.ControllerResolver);
    if (!ioc.has(TOKENS.ResponseRenderer)) {
      ioc.bind(TOKENS.ResponseRenderer).toInstance(new NoopResponseRenderer());
    }
    const renderer = ioc.get<ResponseRenderer>(TOKENS.ResponseRenderer);

    // Initialize router with controller metadata & middlewares
    router.init({
      resolver,
      renderer,
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
        if (typeof res.status === 'number') (res as any).statusCode = 404;
        (res as any).end?.();
        return;
      }

      await Promise.resolve(handler(req, res));
    });
  }
}
