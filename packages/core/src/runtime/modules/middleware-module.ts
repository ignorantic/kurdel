import { Container } from '@kurdel/ioc';
import { AppModule } from 'src/api/app-module.js';
import { MiddlewareRegistry } from 'src/runtime/middleware-registry.js';
import { Middleware } from 'src/api/types.js';
import { errorHandler } from 'src/runtime/http/middlewares/error-handle.js';
import { jsonBodyParser } from 'src/runtime/http/middlewares/json-body-parser.js';

/**
 * MiddlewareModule
 *
 * - Registers global middlewares from all HttpModules
 */
export class MiddlewareModule implements AppModule {
  readonly exports = { registry: MiddlewareRegistry };
  readonly providers = [
    { provide: MiddlewareRegistry, useClass: MiddlewareRegistry, isSingleton: true },
  ];

  constructor(private middlewares: Middleware[]) {}

  async register(ioc: Container): Promise<void> {
    const registry = ioc.get(MiddlewareRegistry);
    
    this.middlewares.forEach((mw) => registry.use(mw));

    // Always include default error handler and body parser
    registry.use(errorHandler);
    registry.use(jsonBodyParser);
  }
}

