import type { AppConfig } from '@kurdel/core/app';
import { ExpressPlatformModule } from '@kurdel/runtime-express/modules';

import { createApplication } from 'src/create-application.js';

/**
 * Factory for initializing a Kurdel application on the Express.js platform.
 *
 * ## Responsibilities
 * - Registers the Express-specific platform module (`ExpressPlatformModule`), which provides:
 *   - `ExpressServerAdapter` — platform-specific `ServerAdapter` implementation
 *   - `ExpressResponseRenderer` — response renderer compatible with Express `Response`
 * - Bootstraps a fully platform-agnostic Kurdel `RuntimeApplication` instance
 *
 * ## Usage
 * ```ts
 * import { createExpressApplication } from '@kurdel/facade';
 *
 * const app = await createExpressApplication({
 *   modules: [MyHttpModule],
 *   db: false,
 * });
 *
 * const server = app.listen(3000, () => console.log('Running on Express'));
 * ```
 *
 * @param config - Application configuration object (controllers, db, modules, etc.)
 * @returns Fully configured application instance using the Express runtime.
 */
export function createExpressApplication({ modules = [], ...config }: AppConfig) {
  return createApplication({
    ...config,
    modules: [...modules, ExpressPlatformModule]
  });
}
