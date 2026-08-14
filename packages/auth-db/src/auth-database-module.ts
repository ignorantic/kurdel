import { AUTH_TOKENS } from '@kurdel/auth';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import { IDatabase } from '@kurdel/db';

import { Sha256ApiKeyHasher, type ApiKeyHasher } from './api-key-hasher.js';
import type { AuthDatabaseTables } from './auth-database-tables.js';
import { DatabaseApiKeyRepository } from './database-api-key-repository.js';
import { DatabaseAuthUserRepository } from './database-auth-user-repository.js';
import { AUTH_DB_TOKENS } from './tokens.js';

export interface AuthDatabaseModuleConfig {
  tables?: Partial<AuthDatabaseTables>;
  apiKeyHasher?: ApiKeyHasher;
}

export class AuthDatabaseModule implements AppModule {
  readonly priority = ModulePriority.User;
  readonly imports = { db: IDatabase };
  readonly exports = {
    userRepository: AUTH_TOKENS.UserRepository,
    apiKeyRepository: AUTH_TOKENS.ApiKeyRepository,
    apiKeyHasher: AUTH_DB_TOKENS.ApiKeyHasher,
  };
  readonly providers: ProviderConfig[];

  constructor(config: AuthDatabaseModuleConfig = {}) {
    const tables = config.tables ?? {};
    const hasher = config.apiKeyHasher ?? new Sha256ApiKeyHasher();
    this.providers = [
      {
        provide: AUTH_DB_TOKENS.ApiKeyHasher,
        useInstance: hasher,
      },
      {
        provide: AUTH_TOKENS.UserRepository,
        useFactory: ioc => new DatabaseAuthUserRepository(ioc.get(IDatabase), tables),
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.ApiKeyRepository,
        useFactory: ioc => new DatabaseApiKeyRepository(
          ioc.get(IDatabase),
          ioc.get(AUTH_DB_TOKENS.ApiKeyHasher),
          tables,
        ),
        singleton: true,
      },
    ];
  }
}
