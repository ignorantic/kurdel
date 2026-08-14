import { AUTH_DB_TOKENS, type ApiKeyHasher } from '@kurdel/auth-db';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import { IDatabase } from '@kurdel/db';

import { AUTH_DB_SAMPLE_TOKENS } from './auth-db-tokens.js';
import { DatabaseApiKeyService } from './database-api-key-service.js';
import { DatabaseUserService } from './database-user-service.js';

export class AuthDbManagementModule implements AppModule {
  readonly priority = ModulePriority.User;
  readonly imports = {
    db: IDatabase,
    apiKeyHasher: AUTH_DB_TOKENS.ApiKeyHasher,
  };

  readonly providers: ProviderConfig[] = [
    {
      provide: AUTH_DB_SAMPLE_TOKENS.UserService,
      useFactory: ioc => new DatabaseUserService(ioc.get(IDatabase)),
      singleton: true,
    },
    {
      provide: AUTH_DB_SAMPLE_TOKENS.ApiKeyService,
      useFactory: ioc => new DatabaseApiKeyService(
        ioc.get(IDatabase),
        ioc.get<ApiKeyHasher>(AUTH_DB_TOKENS.ApiKeyHasher),
      ),
      singleton: true,
    },
  ];
}
