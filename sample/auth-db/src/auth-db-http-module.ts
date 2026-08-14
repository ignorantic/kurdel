import type { HttpModule } from '@kurdel/core/http';
import { schemaValidator } from '@kurdel/runtime/middlewares';

import { AuthDbController } from './auth-db-controller.js';
import { AdminPageController } from './admin-page-controller.js';
import { AUTH_DB_SAMPLE_TOKENS } from './auth-db-tokens.js';

export class AuthDbHttpModule implements HttpModule {
  readonly controllers = [
    { use: AdminPageController, prefix: '/' },
    {
      use: AuthDbController,
      deps: {
        users: AUTH_DB_SAMPLE_TOKENS.UserService,
        apiKeys: AUTH_DB_SAMPLE_TOKENS.ApiKeyService,
      },
      prefix: '/',
    },
  ];

  readonly middlewares = [{ use: schemaValidator, zone: 'pre' as const, priority: 1 }];
}
