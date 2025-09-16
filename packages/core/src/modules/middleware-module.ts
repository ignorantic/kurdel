import { IoCContainer } from '@kurdel/ioc';
import { AppModule } from './app-module.js';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { errorHandler } from '../middlewares/error-handle.js';
import { jsonBodyParser } from '../middlewares/json-body-parser.js';
import { AppConfig } from '../config.js';

/**
 * MiddlewareModule
 *
 * - Registers global middlewares
 * - Provides MiddlewareRegistry as an export
 */
export class MiddlewareModule implements AppModule<AppConfig> {
  readonly exports = { registry: MiddlewareRegistry };

  async register(ioc: IoCContainer, config: AppConfig): Promise<void> {
    const registry = new MiddlewareRegistry();
    ioc.bind(MiddlewareRegistry).toInstance(registry);

    const { middlewares = [] } = config;
    middlewares.forEach((mw) => registry.use(mw));

    // Always include default error handler and body parser
    registry.use(errorHandler);
    registry.use(jsonBodyParser);
  }
}
