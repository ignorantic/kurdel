import type { AppConfig } from 'src/api/app/config.js';
import type { Application } from 'src/api/app/application.js';
import { ApplicationImpl } from 'src/runtime/app/application-impl.js';

/**
 * Runtime façade that constructs and bootstraps the application,
 * returning only the public Application interface.
 */
export async function createApplication(config: AppConfig = {}): Promise<Application> {
  const impl = new ApplicationImpl(config);
  await impl.bootstrap();
  return impl;
}

