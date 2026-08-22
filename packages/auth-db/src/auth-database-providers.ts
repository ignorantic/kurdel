import {
  PasswordAuthenticationService,
  type AuthEventSink,
  type AuthUserRepository,
  type PasswordCredentialRepository,
  type PasswordAuthenticationProtection,
  type PasswordHasher,
} from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import type { ApiKeyHasher } from './api-key-hasher.js';
import type { AuthDatabaseTables } from './auth-database-tables.js';
import { DatabaseApiKeyRepository } from './database-api-key-repository.js';
import { DatabaseApiKeyService } from './database-api-key-service.js';
import { DatabaseApiKeyUsageRecorder } from './database-api-key-usage-recorder.js';
import { DatabaseAuthEventStore } from './database-auth-event-store.js';
import { DatabaseAuthUserRepository } from './database-auth-user-repository.js';
import { DatabaseJwtSessionRepository } from './database-jwt-session-repository.js';
import { DatabaseJwtSessionService } from './database-jwt-session-service.js';
import { DatabasePasswordCredentialRepository } from './database-password-credential-repository.js';
import {
  DatabasePasswordAuthenticationProtection,
  type PasswordAuthenticationProtectionOptions,
} from './database-password-authentication-protection.js';
import { DatabasePasswordService } from './database-password-service.js';
import { DatabaseUserService } from './database-user-service.js';

type DatabaseDeps = { db: Database; tables: AuthDatabaseTables };
type ApiKeyDeps = DatabaseDeps & { hasher: ApiKeyHasher };
type PasswordDeps = DatabaseDeps & { hasher: PasswordHasher };
type AuditedDeps = DatabaseDeps & { events?: AuthEventSink };

export class AuthUserRepositoryProvider extends DatabaseAuthUserRepository {
  constructor({ db, tables }: DatabaseDeps) {
    super(db, tables);
  }
}

export class ApiKeyRepositoryProvider extends DatabaseApiKeyRepository {
  constructor({ db, hasher, tables }: ApiKeyDeps) {
    super(db, hasher, tables);
  }
}

export class ApiKeyUsageRecorderProvider extends DatabaseApiKeyUsageRecorder {
  constructor({ db, tables }: DatabaseDeps) {
    super(db, tables);
  }
}

export class JwtSessionRepositoryProvider extends DatabaseJwtSessionRepository {
  constructor({ db, tables }: DatabaseDeps) {
    super(db, tables);
  }
}

export class PasswordCredentialRepositoryProvider extends DatabasePasswordCredentialRepository {
  constructor({ db, tables }: DatabaseDeps) {
    super(db, tables);
  }
}

export class PasswordAuthenticationProtectionProvider extends DatabasePasswordAuthenticationProtection {
  constructor({ db, tables, options }: DatabaseDeps & { options: PasswordAuthenticationProtectionOptions }) {
    super(db, tables, options);
  }
}

export class PasswordAuthenticationServiceProvider extends PasswordAuthenticationService {
  constructor({ credentials, users, hasher, protection }: {
    credentials: PasswordCredentialRepository;
    users: AuthUserRepository;
    hasher: PasswordHasher;
    protection?: PasswordAuthenticationProtection;
  }) {
    super(credentials, users, hasher, protection);
  }
}

export class UserServiceProvider extends DatabaseUserService {
  constructor({ db, tables }: DatabaseDeps) {
    super(db, tables);
  }
}

export class AuthEventStoreProvider extends DatabaseAuthEventStore {
  constructor({ db, tables }: DatabaseDeps) {
    super(db, tables);
  }
}

export class ApiKeyServiceProvider extends DatabaseApiKeyService {
  constructor({ db, hasher, tables, events }: ApiKeyDeps & AuditedDeps) {
    super(db, hasher, tables, events);
  }
}

export class JwtSessionServiceProvider extends DatabaseJwtSessionService {
  constructor({ db, tables, events }: AuditedDeps) {
    super(db, tables, events);
  }
}

export class PasswordServiceProvider extends DatabasePasswordService {
  constructor({ db, hasher, tables, events }: PasswordDeps & AuditedDeps) {
    super(db, hasher, tables, events);
  }
}
