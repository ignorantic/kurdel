import type { Container } from '@kurdel/ioc';
import type { AppConfig, AppModule } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';
import type {
  ServerAdapter,
  Router,
  ControllerConfig,
  MiddlewareRegistry,
  ControllerResolver,
  ResponseRenderer,
} from '@kurdel/core/http';

import { NoopResponseRenderer } from 'src/http/noop-response-renderer.js';
import { RuntimeRequestOrchestrator } from 'src/http/runtime-request-orchestrator.js';
import { ModulePriority } from 'src/app/module-priority.js';

/**
 * ServerModule: wires the HTTP ServerAdapter to the Router.
 *
 * ## Responsibilities
 * - Binds the platform-agnostic `ServerAdapter` (provided externally)
 * - Initializes the `Router` with controller metadata and global middlewares
 * - Creates the `RuntimeRequestOrchestrator` to handle per-request execution
 * - Subscribes the orchestrator to incoming HTTP requests from the adapter
 *
 * ## Design Notes
 * - The module itself contains **no platform-specific logic**
 * - Orchestrator fully owns request lifecycle (scope, middleware, controller, render)
 */
export class ServerModule implements AppModule<AppConfig> {
  readonly priority = ModulePriority.Server;

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
    const renderer = ioc.get<ResponseRenderer>(TOKENS.ResponseRenderer);

    // --- ensure a response renderer exists
    if (!ioc.has(TOKENS.ResponseRenderer)) {
      ioc.bind(TOKENS.ResponseRenderer).toInstance(new NoopResponseRenderer());
    }

    // --- initialize router once with all metadata
    router.init(resolver, controllerConfigs);

    // --- compose orchestrator for request lifecycle
    const orchestrator = new RuntimeRequestOrchestrator(router, renderer, registry.all());

    // --- connect adapter to orchestrator
    adapter.on(async (req, res) => {
      const scope = ioc.createScope?.() ?? ioc;

      try {
        await orchestrator.execute(req, res, scope);
      } catch (err) {
        // fallback-level error safety
        console.error(`[ServerModule] Uncaught error in orchestrator for ${req.method} ${req.url}:`, err);
        if ((res as any).statusCode !== 500) (res as any).statusCode = 500;
        renderer.render(res, { status: 500, kind: 'text', body: 'Internal Server Error' });
      }
    });
  }
}
