import type { AppConfig } from '@kurdel/core/app';
import { ExpressServerAdapter } from '@kurdel/runtime-express';
import { NodeHttpRuntimeModule } from '@kurdel/runtime-node/modules';

import { createApplication } from 'src/create-application.js';

/**
 * Factory for Express.js runtime environment.
 *
 * Responsibilities:
 * - Instantiates the Express-based ServerAdapter (`ExpressServerAdapter`)
 * - Provides it to the runtime-level Application
 * - Keeps the rest of the framework fully platform-agnostic
 */
export function createExpressApplication(config: AppConfig) {
  const serverAdapter = new ExpressServerAdapter();

  return createApplication({
    ...config,
    serverAdapter,
    modules: [...config.modules ?? [], NodeHttpRuntimeModule]
  });
}
