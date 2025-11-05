import type { AppConfig } from '@kurdel/core/app';
import { NodePlatformModule } from '@kurdel/runtime-node/modules';

import { createApplication } from 'src/create-application.js';

/**
 * Factory for initializing a Kurdel application on the native Node.js platform.
 *
 * ## Responsibilities
 * - Registers the Node-specific platform module (`NodePlatformModule`), which provides:
 *   - `NativeHttpServerAdapter` — platform-specific `ServerAdapter` implementation
 *   - `NodeResponseRenderer` — renderer for native Node.js HTTP responses
 * - Bootstraps a fully platform-agnostic Kurdel `RuntimeApplication` instance
 *
 * ## Usage
 * ```ts
 * import { createNodeApplication } from '@kurdel/facade';
 *
 * const app = await createNodeApplication({
 *   modules: [MyHttpModule],
 *   db: false,
 * });
 *
 * const server = app.listen(3000, () => console.log('Running on native Node.js'));
 * ```
 *
 * @param config - Application configuration object (controllers, db, modules, etc.)
 * @returns Fully configured application instance using the Node.js runtime.
 */
export function createNodeApplication({ modules = [], ...config }: AppConfig) {
  return createApplication({
    ...config,
    modules: [...modules, NodePlatformModule]
  });
}
