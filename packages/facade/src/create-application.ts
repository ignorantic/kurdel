import type { AppConfig, Application } from '@kurdel/core/app';
import { RuntimeApplication } from '@kurdel/runtime/app';

/**
 * Runtime façade that constructs and bootstraps the application,
 * returning only the public Application interface.
 */
export async function createApplication(config: AppConfig): Promise<Application> {
  const app = new RuntimeApplication(config);
  await app.bootstrap();
  return app;
}
