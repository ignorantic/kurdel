import type { PasswordCredential, PasswordCredentialRepository } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

type CredentialRecord = { user_id: string | number; password_hash: string };

/**
 * ## DatabasePasswordCredentialRepository
 *
 * Database-backed repository for password authentication credentials.
 *
 * Responsibilities:
 * - locate password credentials by login identifier
 * - map database records to `PasswordCredential`
 * - isolate authentication from the underlying database schema
 *
 * Guarantees:
 * - returns `null` when no matching credentials exist
 * - performs case-insensitive login lookup
 * - remains database-agnostic (SQLite/PostgreSQL)
 *
 * Non-responsibilities:
 * - password verification
 * - password hashing
 * - user management
 * - authentication workflows
 */
export class DatabasePasswordCredentialRepository implements PasswordCredentialRepository {
  private readonly tables: AuthDatabaseTables;

  /**
   * Creates a new database-backed password credential repository.
   *
   * @param db Database abstraction used for persistence.
   * @param tables Optional table name overrides.
   */
  constructor(
    private readonly db: Database,
    tables: Partial<AuthDatabaseTables> = {}
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  async findByLogin(login: string): Promise<PasswordCredential | null> {
    const record = (await this.db.get({
      sql: [
        `SELECT credentials.user_id, credentials.password_hash FROM ${this.tables.passwordCredentials} credentials`,
        `INNER JOIN ${this.tables.users} users ON users.id = credentials.user_id`,
        'WHERE LOWER(users.email) = LOWER(?);',
      ].join(' '),
      params: [login.trim()],
    })) as CredentialRecord | undefined;
    return record ? { userId: record.user_id, passwordHash: record.password_hash } : null;
  }
}
