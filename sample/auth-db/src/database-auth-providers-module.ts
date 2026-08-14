import { AUTH_TOKENS } from '@kurdel/auth';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import { IDatabase } from '@kurdel/db';

import { DatabaseApiKeyRepository } from './database-api-key-repository.js';
import { DatabaseApiKeyService } from './database-api-key-service.js';
import { DatabaseAuthUserRepository } from './database-auth-user-repository.js';
import { AUTH_DB_TOKENS } from './auth-db-tokens.js';
import { DatabaseUserService } from './database-user-service.js';

export class DatabaseAuthProvidersModule implements AppModule {
  readonly priority = ModulePriority.User;
  readonly imports = { db: IDatabase };

  readonly providers: ProviderConfig[] = [
    {
      provide: AUTH_TOKENS.UserRepository,
      useFactory: ioc => new DatabaseAuthUserRepository(ioc.get(IDatabase)),
      singleton: true,
    },
    {
      provide: AUTH_TOKENS.ApiKeyRepository,
      useFactory: ioc => new DatabaseApiKeyRepository(ioc.get(IDatabase)),
      singleton: true,
    },
    {
      provide: AUTH_DB_TOKENS.UserService,
      useFactory: ioc => new DatabaseUserService(ioc.get(IDatabase)),
      singleton: true,
    },
    {
      provide: AUTH_DB_TOKENS.ApiKeyService,
      useFactory: ioc => new DatabaseApiKeyService(ioc.get(IDatabase)),
      singleton: true,
    },
  ];
}
