import { IoCContainer } from '@kurdel/ioc';
import { MiddlewareRegistry } from '../middleware-registry.js';
import { Middleware } from '../types.js';
import { errorHandler } from '../middlewares/error-handle.js';
import { AppConfig } from '../config.js';
import { Initializer } from './initializer.js';

export class MiddlewareInitializer implements Initializer {
  run(ioc: IoCContainer, config: AppConfig) {
    const registry = new MiddlewareRegistry();
    ioc.bind(MiddlewareRegistry).toInstance(registry);

    (config.middlewares ?? []).forEach((mw: Middleware) => registry.use(mw));
    registry.use(errorHandler);
  }
}
