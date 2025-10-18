import type { AppConfig } from '@kurdel/core/app';
import { NativeHttpServerAdapter } from '@kurdel/runtime-node';
import { RuntimeRouter } from '@kurdel/runtime/http';

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
  const router = new RuntimeRouter();
  const serverAdapter = new NativeHttpServerAdapter(router);

  return createApplication({
    ...config,
    serverAdapter,
  });
}
