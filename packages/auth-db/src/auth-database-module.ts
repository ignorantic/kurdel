import {
  AUTH_TOKENS,
  PasswordAuthenticationService,
  ScryptPasswordHasher,
  type PasswordHasher,
} from '@kurdel/auth';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import { Database } from '@kurdel/db';

import { Sha256ApiKeyHasher, type ApiKeyHasher } from './api-key-hasher.js';
import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';
import { DatabaseApiKeyRepository } from './database-api-key-repository.js';
import { DatabaseApiKeyService } from './database-api-key-service.js';
import { DatabaseApiKeyUsageRecorder } from './database-api-key-usage-recorder.js';
import { DatabaseAuthEventStore } from './database-auth-event-store.js';
import { DatabaseAuthUserRepository } from './database-auth-user-repository.js';
import { DatabaseJwtSessionRepository } from './database-jwt-session-repository.js';
import { DatabaseJwtSessionService } from './database-jwt-session-service.js';
import { DatabasePasswordCredentialRepository } from './database-password-credential-repository.js';
import { DatabasePasswordService } from './database-password-service.js';
import { DatabaseUserService } from './database-user-service.js';
import { AUTH_DB_TOKENS } from './tokens.js';
import {
  DatabasePasswordAuthenticationProtection,
  type PasswordAuthenticationProtectionOptions,
} from './database-password-authentication-protection.js';

const AUTH_DB_TABLES = Symbol('AuthDbTables');

/**
 * ## AuthDatabaseModuleConfig
 *
 * Configures database-backed authentication services.
 */
export interface AuthDatabaseModuleConfig {
  tables?: Partial<AuthDatabaseTables>;
  apiKeyHasher?: ApiKeyHasher;
  passwordHasher?: PasswordHasher;
  /** Configures login throttling. Enabled with secure defaults unless set to false. */
  passwordProtection?: PasswordAuthenticationProtectionOptions | false;
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
    const resolvedTables = resolveAuthDatabaseTables(tables);
    const hasher = config.apiKeyHasher ?? new Sha256ApiKeyHasher();
    const passwordHasher = config.passwordHasher ?? new ScryptPasswordHasher();
    const passwordProtection = config.passwordProtection === false ? false : config.passwordProtection ?? {};
    this.exports = {
      userRepository: AUTH_TOKENS.UserRepository,
      apiKeyRepository: AUTH_TOKENS.ApiKeyRepository,
      apiKeyUsageRecorder: AUTH_TOKENS.ApiKeyUsageRecorder,
      jwtSessionRepository: AUTH_TOKENS.JwtSessionRepository,
      passwordCredentialRepository: AUTH_TOKENS.PasswordCredentialRepository,
      passwordAuthenticationService: AUTH_TOKENS.PasswordAuthenticationService,
      ...(passwordProtection ? { passwordAuthenticationProtection: AUTH_TOKENS.PasswordAuthenticationProtection } : {}),
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
        provide: AUTH_DB_TABLES,
        useInstance: resolvedTables,
      },
      ...(passwordProtection ? [
        {
          provide: AUTH_DB_TOKENS.PasswordAuthenticationProtectionOptions,
          useInstance: passwordProtection,
        },
        {
          provide: AUTH_TOKENS.PasswordAuthenticationProtection,
          useClass: DatabasePasswordAuthenticationProtection,
          deps: {
            db: Database,
            tables: AUTH_DB_TABLES,
            options: AUTH_DB_TOKENS.PasswordAuthenticationProtectionOptions,
          },
          singleton: true,
        },
      ] : []),
      {
        provide: AUTH_TOKENS.UserRepository,
        useClass: DatabaseAuthUserRepository,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.ApiKeyRepository,
        useClass: DatabaseApiKeyRepository,
        deps: { db: Database, hasher: AUTH_DB_TOKENS.ApiKeyHasher, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.ApiKeyUsageRecorder,
        useClass: DatabaseApiKeyUsageRecorder,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.JwtSessionRepository,
        useClass: DatabaseJwtSessionRepository,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.PasswordCredentialRepository,
        useClass: DatabasePasswordCredentialRepository,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.PasswordAuthenticationService,
        useClass: PasswordAuthenticationService,
        deps: {
          credentials: AUTH_TOKENS.PasswordCredentialRepository,
          users: AUTH_TOKENS.UserRepository,
          hasher: AUTH_DB_TOKENS.PasswordHasher,
          ...(passwordProtection ? { protection: AUTH_TOKENS.PasswordAuthenticationProtection } : {}),
        },
        singleton: true,
      },
      {
        provide: AUTH_DB_TOKENS.UserService,
        useClass: DatabaseUserService,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      ...(config.audit
        ? [
            {
              provide: AUTH_DB_TOKENS.EventStore,
              useClass: DatabaseAuthEventStore,
              deps: { db: Database, tables: AUTH_DB_TABLES },
              singleton: true,
            },
          ]
        : []),
      {
        provide: AUTH_DB_TOKENS.ApiKeyService,
        useClass: DatabaseApiKeyService,
        deps: {
          db: Database,
          hasher: AUTH_DB_TOKENS.ApiKeyHasher,
          tables: AUTH_DB_TABLES,
          ...(config.audit ? { events: AUTH_DB_TOKENS.EventStore } : {}),
        },
        singleton: true,
      },
      {
        provide: AUTH_DB_TOKENS.JwtSessionService,
        useClass: DatabaseJwtSessionService,
        deps: {
          db: Database,
          tables: AUTH_DB_TABLES,
          ...(config.audit ? { events: AUTH_DB_TOKENS.EventStore } : {}),
        },
        singleton: true,
      },
      {
        provide: AUTH_DB_TOKENS.PasswordService,
        useClass: DatabasePasswordService,
        deps: {
          db: Database,
          hasher: AUTH_DB_TOKENS.PasswordHasher,
          tables: AUTH_DB_TABLES,
          ...(config.audit ? { events: AUTH_DB_TOKENS.EventStore } : {}),
        },
        singleton: true,
      },
    ];
  }
}
