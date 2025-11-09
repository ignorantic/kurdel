import type { AppConfig } from '@kurdel/core/app';
import type { HttpModule, MiddlewareRegistration } from '@kurdel/core/http';

import { loggerMiddleware } from '../middlewares/logger.js';

export class LoggerModule implements HttpModule<AppConfig> {
  readonly middlewares = [
    {
      use: loggerMiddleware,
      zone: 'final',
      priority: 0,
    }
  ] satisfies MiddlewareRegistration[];
  register() {}
}

