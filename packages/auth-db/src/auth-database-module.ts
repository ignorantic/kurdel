import {
  AUTH_TOKENS,
  ScryptPasswordHasher,
  type PasswordHasher,
} from '@kurdel/auth';
import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import { Database } from '@kurdel/db';

import { Sha256ApiKeyHasher, type ApiKeyHasher } from './api-key-hasher.js';
import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';
import {
  ApiKeyRepositoryProvider,
  ApiKeyServiceProvider,
  ApiKeyUsageRecorderProvider,
  AuthEventStoreProvider,
  AuthUserRepositoryProvider,
  JwtSessionRepositoryProvider,
  JwtSessionServiceProvider,
  PasswordAuthenticationServiceProvider,
  PasswordAuthenticationProtectionProvider,
  PasswordCredentialRepositoryProvider,
  PasswordServiceProvider,
  UserServiceProvider,
} from './auth-database-providers.js';
import { AUTH_DB_TOKENS } from './tokens.js';
import type { PasswordAuthenticationProtectionOptions } from './database-password-authentication-protection.js';

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
          useClass: PasswordAuthenticationProtectionProvider,
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
        useClass: AuthUserRepositoryProvider,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.ApiKeyRepository,
        useClass: ApiKeyRepositoryProvider,
        deps: { db: Database, hasher: AUTH_DB_TOKENS.ApiKeyHasher, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.ApiKeyUsageRecorder,
        useClass: ApiKeyUsageRecorderProvider,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.JwtSessionRepository,
        useClass: JwtSessionRepositoryProvider,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.PasswordCredentialRepository,
        useClass: PasswordCredentialRepositoryProvider,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      {
        provide: AUTH_TOKENS.PasswordAuthenticationService,
        useClass: PasswordAuthenticationServiceProvider,
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
        useClass: UserServiceProvider,
        deps: { db: Database, tables: AUTH_DB_TABLES },
        singleton: true,
      },
      ...(config.audit
        ? [
            {
              provide: AUTH_DB_TOKENS.EventStore,
              useClass: AuthEventStoreProvider,
              deps: { db: Database, tables: AUTH_DB_TABLES },
              singleton: true,
            },
          ]
        : []),
      {
        provide: AUTH_DB_TOKENS.ApiKeyService,
        useClass: ApiKeyServiceProvider,
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
        useClass: JwtSessionServiceProvider,
        deps: {
          db: Database,
          tables: AUTH_DB_TABLES,
          ...(config.audit ? { events: AUTH_DB_TOKENS.EventStore } : {}),
        },
        singleton: true,
      },
      {
        provide: AUTH_DB_TOKENS.PasswordService,
        useClass: PasswordServiceProvider,
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
