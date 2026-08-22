import type { HttpModule } from '@kurdel/core/http';
import { AUTH_TOKENS, JwtService } from '@kurdel/auth';
import { AUTH_DB_TOKENS } from '@kurdel/auth-db';
import { schemaValidator } from '@kurdel/runtime/middlewares';

import { AdminPageController } from './admin/admin-page-controller.js';
import { AuthDbController } from './auth-db-controller.js';
import { environment } from './environment.js';

export class AuthDbHttpModule implements HttpModule {
  readonly providers = [
    {
      provide: AUTH_TOKENS.JwtService,
      useInstance: new JwtService({ secret: environment.JWT_SECRET, expiresIn: 15 * 60 }),
    },
  ];

  readonly controllers = [
    { use: AdminPageController, prefix: '/' },
    {
      use: AuthDbController,
      deps: {
        users: AUTH_DB_TOKENS.UserService,
        apiKeys: AUTH_DB_TOKENS.ApiKeyService,
        passwords: AUTH_DB_TOKENS.PasswordService,
        passwordAuthentication: AUTH_TOKENS.PasswordAuthenticationService,
        passwordCredentials: AUTH_TOKENS.PasswordCredentialRepository,
        jwtSessions: AUTH_DB_TOKENS.JwtSessionService,
        jwt: AUTH_TOKENS.JwtService,
        events: AUTH_DB_TOKENS.EventStore,
      },
      prefix: '/',
    },
  ];

  readonly middlewares = [{ use: schemaValidator, zone: 'pre' as const, priority: 1 }];
}
