import type { PasswordHasher } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

export class PasswordUserNotFoundError extends Error {
  constructor(readonly userId: number) {
    super(`User '${userId}' was not found`);
  }
}

/**
 * ## DatabasePasswordService
 *
 * Application service responsible for managing user password credentials
 * backed by a relational database through the `Database` abstraction.
 *
 * Responsibilities:
 * - set or replace user password credentials
 * - hash passwords before persisting them
 * - ensure the target user exists
 *
 * Guarantees:
 * - never stores plaintext passwords
 * - delegates password hashing to the configured `PasswordHasher`
 * - performs updates atomically using a database transaction
 * - remains database-agnostic (SQLite/PostgreSQL)
 *
 * Non-responsibilities:
 * - password verification
 * - password policy enforcement
 * - password reset workflows
 * - authentication
 * - HTTP request handling
 */
export class DatabasePasswordService {
  private readonly tables: AuthDatabaseTables;

  /**
   * Creates a new database-backed password management service.
   *
   * @param db Database abstraction used for persistence.
   * @param hasher Password hasher used to derive secure password hashes.
   * @param tables Optional table name overrides.
   */
  constructor(
    private readonly db: Database,
    private readonly hasher: PasswordHasher,
    tables: Partial<AuthDatabaseTables> = {}
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  async set(userId: number, password: string): Promise<void> {
    const passwordHash = await this.hasher.hash(password);
    await this.db.transaction(async transaction => {
      const user = await transaction.get({
        sql: `SELECT id FROM ${this.tables.users} WHERE id = ?;`,
        params: [userId],
      });
      if (!user) throw new PasswordUserNotFoundError(userId);
      await transaction.run({
        sql: [
          `INSERT INTO ${this.tables.passwordCredentials} (user_id, password_hash, updated_at)`,
          'VALUES (?, ?, CURRENT_TIMESTAMP)',
          'ON CONFLICT(user_id) DO UPDATE SET password_hash = excluded.password_hash, updated_at = CURRENT_TIMESTAMP;',
        ].join(' '),
        params: [userId, passwordHash],
      });
    });
  }
}
