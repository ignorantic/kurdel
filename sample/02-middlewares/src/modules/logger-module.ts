import { AppModule } from '@kurdel/core';
import { loggerMiddleware } from '../middlewares/logger.js';

export class LoggerModule implements AppModule {
  readonly middlewares = [loggerMiddleware];
  register() {}
}

