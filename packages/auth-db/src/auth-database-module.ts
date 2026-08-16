import { AUTH_TOKENS } from '@kurdel/auth';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import { Database } from '@kurdel/db';
import type { Container } from '@kurdel/ioc';

import { Sha256ApiKeyHasher, type ApiKeyHasher } from './api-key-hasher.js';
import type { AuthDatabaseTables } from './auth-database-tables.js';
import { DatabaseApiKeyRepository } from './database-api-key-repository.js';
import { DatabaseApiKeyService } from './database-api-key-service.js';
import { DatabaseApiKeyUsageRecorder } from './database-api-key-usage-recorder.js';
import { DatabaseAuthUserRepository } from './database-auth-user-repository.js';
import { DatabaseAuthEventStore } from './database-auth-event-store.js';
import { DatabaseJwtSessionRepository } from './database-jwt-session-repository.js';
import { DatabaseJwtSessionService } from './database-jwt-session-service.js';
import { DatabaseUserService } from './database-user-service.js';
import { AUTH_DB_TOKENS } from './tokens.js';

export interface AuthDatabaseModuleConfig {
  tables?: Partial<AuthDatabaseTables>;
  apiKeyHasher?: ApiKeyHasher;
  /** Enables persistence of sanitized authentication audit events. */
  audit?: boolean;
}

export class AuthDatabaseModule implements AppModule {
  readonly priority = ModulePriority.User;
  readonly imports = { db: Database };
  readonly exports: Record<string, symbol>;
  readonly providers: ProviderConfig[];

  constructor(config: AuthDatabaseModuleConfig = {}) {
    const tables = config.tables ?? {};
    const hasher = config.apiKeyHasher ?? new Sha256ApiKeyHasher();
    this.exports = {
      userRepository: AUTH_TOKENS.UserRepository,
      apiKeyRepository: AUTH_TOKENS.ApiKeyRepository,
      apiKeyUsageRecorder: AUTH_TOKENS.ApiKeyUsageRecorder,
      jwtSessionRepository: AUTH_TOKENS.JwtSessionRepository,
      apiKeyHasher: AUTH_DB_TOKENS.ApiKeyHasher,
      userService: AUTH_DB_TOKENS.UserService,
      apiKeyService: AUTH_DB_TOKENS.ApiKeyService,
      jwtSessionService: AUTH_DB_TOKENS.JwtSessionService,
      ...(config.audit ? { eventStore: AUTH_DB_TOKENS.EventStore } : {}),
    };
    this.providers = [
      {
        provide: AUTH_DB_TOKENS.ApiKeyHasher,
        useInstance: hasher,
      },
      {
        provide: AUTH_TOKENS.UserRepository,
        useFactory: ioc => new DatabaseAuthUserRepository(ioc.get(Database), tables),
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.ApiKeyRepository,
        useFactory: ioc =>
          new DatabaseApiKeyRepository(
            ioc.get(Database),
            ioc.get(AUTH_DB_TOKENS.ApiKeyHasher),
            tables
          ),
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.ApiKeyUsageRecorder,
        useFactory: ioc => new DatabaseApiKeyUsageRecorder(ioc.get(Database), tables),
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.JwtSessionRepository,
        useFactory: ioc => new DatabaseJwtSessionRepository(ioc.get(Database), tables),
        singleton: true,
      },
      {
        provide: AUTH_DB_TOKENS.UserService,
        useFactory: ioc => new DatabaseUserService(ioc.get(Database), tables),
        singleton: true,
      },
      ...(config.audit
        ? [
            {
              provide: AUTH_DB_TOKENS.EventStore,
              useFactory: (ioc: Container) =>
                new DatabaseAuthEventStore(ioc.get(Database), tables),
              singleton: true,
            },
          ]
        : []),
      {
        provide: AUTH_DB_TOKENS.ApiKeyService,
        useFactory: ioc =>
          new DatabaseApiKeyService(
            ioc.get(Database),
            ioc.get(AUTH_DB_TOKENS.ApiKeyHasher),
            tables,
            config.audit ? ioc.get(AUTH_DB_TOKENS.EventStore) : undefined
          ),
        singleton: true,
      },
      {
        provide: AUTH_DB_TOKENS.JwtSessionService,
        useFactory: ioc =>
          new DatabaseJwtSessionService(
            ioc.get(Database),
            tables,
            config.audit ? ioc.get(AUTH_DB_TOKENS.EventStore) : undefined,
          ),
        singleton: true,
      },
    ];
  }
}
