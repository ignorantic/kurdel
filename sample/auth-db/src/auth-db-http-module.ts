import type { HttpModule } from '@kurdel/core/http';

import { AuthDbController } from './auth-db-controller.js';

export class AuthDbHttpModule implements HttpModule {
  readonly controllers = [
    {
      use: AuthDbController,
      prefix: '/',
    },
  ];
}
