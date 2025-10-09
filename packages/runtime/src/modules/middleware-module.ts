import { Container } from '@kurdel/ioc';

import { TOKENS } from '@kurdel/core/app';
import { AppModule, ProviderConfig } from '@kurdel/core/app';
import { Middleware, MiddlewareRegistry } from '@kurdel/core/http';

import { MiddlewareRegistryImpl } from 'src/http/middleware-registry-impl.js';
import { errorHandler } from 'src/http/middlewares/error-handle.js';
import { jsonBodyParser } from 'src/http/middlewares/json-body-parser.js';

/**
 * MiddlewareModule
 *
 * - Provides a singleton MiddlewareRegistry
 * - Registers default global middlewares and app-provided ones
 */
export class MiddlewareModule implements AppModule {
  readonly exports = { registry: TOKENS.MiddlewareRegistry };
  readonly providers: ProviderConfig[] = [
    {
      provide: TOKENS.MiddlewareRegistry,
      useClass: MiddlewareRegistryImpl,
      isSingleton: true,
    },
  ];

  constructor(private middlewares: Middleware[]) {}

  async register(ioc: Container): Promise<void> {
    const registry = ioc.get<MiddlewareRegistry>(TOKENS.MiddlewareRegistry); 

    // Recommended order:
    // 1) parsers (json) → 2) user middlewares → 3) error handler (last)
    registry.use(errorHandler);
    this.middlewares.forEach((mw) => registry.use(mw));
    registry.use(jsonBodyParser);
  }
}

