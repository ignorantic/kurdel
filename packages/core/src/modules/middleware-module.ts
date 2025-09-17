import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from './app-module.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Middleware } from '../types.js';
import { errorHandler } from '../middlewares/error-handle.js';
import { jsonBodyParser } from '../middlewares/json-body-parser.js';

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

  async register(ioc: IoCContainer): Promise<void> {
    const registry = ioc.get(MiddlewareRegistry);
    
    this.middlewares.forEach((mw) => registry.use(mw));

    // Always include default error handler and body parser
    registry.use(errorHandler);
    registry.use(jsonBodyParser);
  }
}

