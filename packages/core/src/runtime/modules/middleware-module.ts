import { Container } from '@kurdel/ioc';

import { TOKENS } from 'src/api/app/tokens.js';
import { AppModule, ProviderConfig } from 'src/api/app/app-module.js';
import { Middleware } from 'src/api/http/types.js';
import { MiddlewareRegistry } from 'src/api/http/middleware-registry.js';

import { MiddlewareRegistryImpl } from '../app/middleware-registry-impl.js';
import { errorHandler } from '../http/middlewares/error-handle.js';
import { jsonBodyParser } from '../http/middlewares/json-body-parser.js';

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

