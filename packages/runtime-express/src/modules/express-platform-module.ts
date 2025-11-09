import type { AppModule } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';
import { ModulePriority } from '@kurdel/runtime/app';
import { RuntimeResponseRenderer } from '@kurdel/runtime/http';

import { ExpressServerAdapter } from 'src/http/express-server-adapter.js';
import { renderExpressResultAdapter } from 'src/http/render-express-result-adapter.js';

/**
 * Platform module for the Express.js runtime environment.
 *
 * ## Responsibilities
 * - Registers the Express-specific `ServerAdapter` and `ResponseRenderer`
 *   implementations required for running Kurdel on Express.
 *
 * ## Provided tokens
 * - {@link TOKENS.ServerAdapter} → {@link ExpressServerAdapter}
 * - {@link TOKENS.ResponseRenderer} → {@link RuntimeResponseRenderer} configured with `renderExpressResultAdapter`
 *
 * ## Priority
 * `ModulePriority.Platform` — ensures that the platform bindings
 * are applied before the generic runtime modules (e.g., `ServerModule`).
 *
 * ## Usage
 * Typically added automatically by {@link createExpressApplication}:
 * ```ts
 * const app = await createExpressApplication({
 *   modules: [MyHttpModule],
 * });
 * ```
 */
export const ExpressPlatformModule: AppModule = {
  priority: ModulePriority.Platform,
  providers: [
    {
      provide: TOKENS.ServerAdapter,
      useFactory: () => new ExpressServerAdapter(),
      singleton: true,
    },
    {
      provide: TOKENS.ResponseRenderer,
      useFactory: () => new RuntimeResponseRenderer(renderExpressResultAdapter),
      singleton: true,
    },
  ],
};
