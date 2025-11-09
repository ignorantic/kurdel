import type { Container } from '@kurdel/ioc';

import { TOKENS } from '@kurdel/core/tokens';
import type { AppModule, ProviderConfig } from '@kurdel/core/app';
import type { MiddlewareRegistration, MiddlewareRegistry } from '@kurdel/core/http';

import { RuntimeMiddlewareRegistry } from 'src/http/runtime-middleware-registry.js';
import { errorHandler } from 'src/middlewares/error-handle.js';
import { jsonBodyParser } from 'src/middlewares/json-body-parser.js';

/**
 * MiddlewareModule
 *
 * - Provides a singleton MiddlewareRegistry
 * - Registers default global middlewares and app-provided ones
 */
export class MiddlewareModule implements AppModule {
  readonly exports = {
    registry: TOKENS.MiddlewareRegistry,
  };

  readonly providers: ProviderConfig[] = [
    {
      provide: TOKENS.MiddlewareRegistry,
      useClass: RuntimeMiddlewareRegistry,
      singleton: true,
    },
  ];

  constructor(private middlewares: MiddlewareRegistration[]) {}

  async register(ioc: Container): Promise<void> {
    const registry = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry);

    // Recommended order:
    // 1) parsers (json) → 2) user middlewares → 3) error handler (last)
    registry.use(errorHandler, {
      zone: 'pre',
      priority: 0,
    });
    for (const entry of this.middlewares) {
      registry.use(entry.use, {
        zone: entry.zone,
        priority: entry.priority,
      });
    }
    registry.use(jsonBodyParser, {
      zone: 'post',
      priority: 0,
    });
  }
}
