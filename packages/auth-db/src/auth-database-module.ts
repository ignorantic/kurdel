import {
  AUTH_TOKENS,
  PasswordAuthenticationService,
  ScryptPasswordHasher,
  type PasswordHasher,
} from '@kurdel/auth';
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
import { DatabasePasswordCredentialRepository } from './database-password-credential-repository.js';
import { DatabasePasswordService } from './database-password-service.js';
import { DatabaseUserService } from './database-user-service.js';
import { AUTH_DB_TOKENS } from './tokens.js';

/**
 * ## AuthDatabaseModuleConfig
 *
 * Configures database-backed authentication services.
 */
export interface AuthDatabaseModuleConfig {
  tables?: Partial<AuthDatabaseTables>;
  apiKeyHasher?: ApiKeyHasher;
  passwordHasher?: PasswordHasher;
  /** Enables persistence of sanitized authentication audit events. */
  audit?: boolean;
}

/**
 * ## AuthDatabaseModule
 *
 * Integrates `@kurdel/auth` with a relational database.
 *
 * Provides:
 * - authentication repositories
 * - application services
 * - password authentication
 * - JWT session persistence
 * - API key management
 * - optional authentication audit storage
 *
 * Responsibilities:
 * - register database-backed auth infrastructure
 * - expose public DI services
 * - configure hashing implementations
 *
 * Non-responsibilities:
 * - database migrations
 * - runtime authentication pipeline
 * - authorization policies
 */
export class AuthDatabaseModule implements AppModule {
  readonly priority = ModulePriority.User;
  readonly imports = { db: Database };
  readonly exports: Record<string, symbol>;
  readonly providers: ProviderConfig[];

  constructor(config: AuthDatabaseModuleConfig = {}) {
    const tables = config.tables ?? {};
    const hasher = config.apiKeyHasher ?? new Sha256ApiKeyHasher();
    const passwordHasher = config.passwordHasher ?? new ScryptPasswordHasher();
    this.exports = {
      userRepository: AUTH_TOKENS.UserRepository,
      apiKeyRepository: AUTH_TOKENS.ApiKeyRepository,
      apiKeyUsageRecorder: AUTH_TOKENS.ApiKeyUsageRecorder,
      jwtSessionRepository: AUTH_TOKENS.JwtSessionRepository,
      passwordCredentialRepository: AUTH_TOKENS.PasswordCredentialRepository,
      passwordAuthenticationService: AUTH_TOKENS.PasswordAuthenticationService,
      apiKeyHasher: AUTH_DB_TOKENS.ApiKeyHasher,
      userService: AUTH_DB_TOKENS.UserService,
      apiKeyService: AUTH_DB_TOKENS.ApiKeyService,
      jwtSessionService: AUTH_DB_TOKENS.JwtSessionService,
      passwordService: AUTH_DB_TOKENS.PasswordService,
      ...(config.audit ? { eventStore: AUTH_DB_TOKENS.EventStore } : {}),
    };
    this.providers = [
      {
        provide: AUTH_DB_TOKENS.ApiKeyHasher,
        useInstance: hasher,
      },
      {
        provide: AUTH_DB_TOKENS.PasswordHasher,
        useInstance: passwordHasher,
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
        provide: AUTH_TOKENS.PasswordCredentialRepository,
        useFactory: ioc => new DatabasePasswordCredentialRepository(ioc.get(Database), tables),
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.PasswordAuthenticationService,
        useFactory: ioc =>
          new PasswordAuthenticationService(
            ioc.get(AUTH_TOKENS.PasswordCredentialRepository),
            ioc.get(AUTH_TOKENS.UserRepository),
            ioc.get(AUTH_DB_TOKENS.PasswordHasher)
          ),
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
              useFactory: (ioc: Container) => new DatabaseAuthEventStore(ioc.get(Database), tables),
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
            config.audit ? ioc.get(AUTH_DB_TOKENS.EventStore) : undefined
          ),
        singleton: true,
      },
      {
        provide: AUTH_DB_TOKENS.PasswordService,
        useFactory: ioc =>
          new DatabasePasswordService(
            ioc.get(Database),
            ioc.get(AUTH_DB_TOKENS.PasswordHasher),
            tables
          ),
        singleton: true,
      },
    ];
  }
}
