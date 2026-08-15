import type { HttpModule } from '@kurdel/core/http';
import { AUTH_DB_TOKENS } from '@kurdel/auth-db';
import { schemaValidator } from '@kurdel/runtime/middlewares';

import { AdminPageController } from './admin/admin-page-controller.js';
import { AuthDbController } from './auth-db-controller.js';

export class AuthDbHttpModule implements HttpModule {
  readonly controllers = [
    { use: AdminPageController, prefix: '/' },
    {
      use: AuthDbController,
      deps: {
        users: AUTH_DB_TOKENS.UserService,
        apiKeys: AUTH_DB_TOKENS.ApiKeyService,
      },
      prefix: '/',
    },
  ];

  readonly middlewares = [{ use: schemaValidator, zone: 'pre' as const, priority: 1 }];
}
