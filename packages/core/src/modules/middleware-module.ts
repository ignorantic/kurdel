import { MiddlewareRegistry } from '../middleware-registry.js';
import { errorHandler } from '../middlewares/error-handle.js';
import { IoCContainer } from '@kurdel/ioc';
import { Middleware } from '../types.js';
import { AppConfig } from '../config.js';
import { AppModule } from './app-module.js';

/**
 * MiddlewareModule
 *
 * - Exports: MiddlewareRegistry
 * - Imports: none
 *
 * Registers global middleware pipeline:
 * - creates MiddlewareRegistry
 * - attaches user-provided middlewares
 * - always attaches built-in errorHandler as last middleware
 */
export const MiddlewareModule: AppModule = {
  exports: { registry: MiddlewareRegistry },

  register(ioc: IoCContainer, config: AppConfig) {
    const registry = new MiddlewareRegistry();
    ioc.bind(MiddlewareRegistry).toInstance(registry);

    (config.middlewares ?? []).forEach((mw: Middleware) => registry.use(mw));
    registry.use(errorHandler);
  },
};
