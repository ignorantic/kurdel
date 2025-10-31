import type { AppConfig } from '@kurdel/core/app';
import { NativeHttpServerAdapter } from '@kurdel/runtime-node/http';
import { NodeHttpRuntimeModule } from '@kurdel/runtime-node/modules';

import { createApplication } from 'src/create-application.js';

/**
 * Factory for Node.js runtime environment.
 *
 * Responsibilities:
 * - Instantiates a platform-specific ServerAdapter (`NativeHttpServerAdapter`)
 * - Provides it to the runtime-level Application
 * - Keeps the rest of the framework completely platform-agnostic
 */
export function createNodeApplication(config: AppConfig) {
  const serverAdapter = new NativeHttpServerAdapter();

  return createApplication({
    ...config,
    serverAdapter,
    modules: [...config.modules ?? [], NodeHttpRuntimeModule]
  });
}
