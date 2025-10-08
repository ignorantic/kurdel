import type { Container } from '@kurdel/ioc';

import type { AppModule } from 'src/api/app/app-module.js';
import type { AppConfig } from 'src/api/app/config.js';
import { TOKENS } from 'src/api/app/tokens.js';

export class LifecycleModule implements AppModule<AppConfig> {
  readonly exports = {
    onStart: TOKENS.OnStart,
    onShutdown: TOKENS.OnShutdown,
  };

  async register(ioc: Container): Promise<void> {
    // Initialize arrays only once; if already present, keep them
    if (!ioc.has(TOKENS.OnStart))    ioc.set(TOKENS.OnStart, []);
    if (!ioc.has(TOKENS.OnShutdown)) ioc.set(TOKENS.OnShutdown, []);
  }
}
