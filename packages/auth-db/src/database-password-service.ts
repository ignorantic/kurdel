import crypto from 'node:crypto';

import type { AuthEvent, AuthEventSink, PasswordHasher } from '@kurdel/auth';
import type { Database, DatabaseSession } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

export class PasswordUserNotFoundError extends Error {
  constructor(readonly userId: number) {
    super(`User '${userId}' was not found`);
  }
}

export class InvalidCurrentPasswordError extends Error {
  constructor() {
    super('Current password is invalid');
  }
}

export class InvalidPasswordResetTokenError extends Error {
  constructor() {
    super('Password reset token is invalid or expired');
  }
}

export type CreatedPasswordReset = {
  userId: number;
  token: string;
  expiresAt: string;
};

type TransactionalAuthEventSink = AuthEventSink & {
  report(event: AuthEvent, database?: DatabaseSession): Promise<void> | void;
};

/**
 * ## DatabasePasswordService
 *
 * Application service responsible for managing user password credentials
 * backed by a relational database through the `Database` abstraction.
 *
 * Responsibilities:
 * - set, change, and reset user password credentials
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
    tables: Partial<AuthDatabaseTables> = {},
    private readonly events?: TransactionalAuthEventSink,
    private readonly now: () => Date = () => new Date()
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
      await this.replacePassword(transaction, userId, passwordHash);
    });
  }

  /** Changes a password after verifying the current credential. */
  async change(userId: number, currentPassword: string, nextPassword: string): Promise<void> {
    const nextPasswordHash = await this.hasher.hash(nextPassword);
    await this.db.transaction(async transaction => {
      const credential = await transaction.get({
        sql: [
          'SELECT credentials.password_hash',
          `FROM ${this.tables.passwordCredentials} AS credentials`,
          `INNER JOIN ${this.tables.users} AS users ON users.id = credentials.user_id`,
          "WHERE credentials.user_id = ? AND users.status = 'active';",
        ].join(' '),
        params: [userId],
      }) as { password_hash: string } | undefined;
      if (!credential) throw new PasswordUserNotFoundError(userId);
      if (!(await this.hasher.verify(currentPassword, credential.password_hash))) {
        throw new InvalidCurrentPasswordError();
      }

      await this.replacePassword(transaction, userId, nextPasswordHash);
      await this.revokeSessions(transaction, userId);
      await this.events?.report({
        type: 'password.changed',
        occurredAt: this.now(),
        userId,
      }, transaction);
    });
  }

  /** Issues a single-use opaque password reset token for an active user. */
  async createReset(userId: number, expiresAt: Date): Promise<CreatedPasswordReset> {
    const now = this.now();
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
      throw new RangeError('Password reset expiration must be in the future');
    }
    const token = `kdl_pr_${crypto.randomBytes(32).toString('base64url')}`;

    await this.db.transaction(async transaction => {
      const user = await transaction.get({
        sql: `SELECT id FROM ${this.tables.users} WHERE id = ? AND status = 'active';`,
        params: [userId],
      });
      if (!user) throw new PasswordUserNotFoundError(userId);

      await transaction.run({
        sql: `DELETE FROM ${this.tables.passwordResetTokens} WHERE user_id = ?;`,
        params: [userId],
      });
      await transaction.run({
        sql: [
          `INSERT INTO ${this.tables.passwordResetTokens}`,
          '(token_hash, user_id, expires_at) VALUES (?, ?, ?);',
        ].join(' '),
        params: [this.hashResetToken(token), userId, expiresAt.toISOString()],
      });
      await this.events?.report({
        type: 'password-reset.requested',
        occurredAt: now,
        userId,
      }, transaction);
    });

    return { userId, token, expiresAt: expiresAt.toISOString() };
  }

  /** Consumes a reset token, replaces the password, and revokes active sessions. */
  async reset(token: string, nextPassword: string): Promise<void> {
    const nextPasswordHash = await this.hasher.hash(nextPassword);
    const now = this.now();

    await this.db.transaction(async transaction => {
      const reset = await transaction.get({
        sql: [
          `DELETE FROM ${this.tables.passwordResetTokens}`,
          'WHERE token_hash = ? RETURNING user_id, expires_at;',
        ].join(' '),
        params: [this.hashResetToken(token)],
      }) as { user_id: string | number; expires_at: string } | undefined;
      const expiresAt = reset ? new Date(reset.expires_at) : undefined;
      if (!reset || !expiresAt || !Number.isFinite(expiresAt.getTime()) || expiresAt <= now) {
        throw new InvalidPasswordResetTokenError();
      }
      const userId = Number(reset.user_id);
      const user = await transaction.get({
        sql: `SELECT id FROM ${this.tables.users} WHERE id = ? AND status = 'active';`,
        params: [userId],
      });
      if (!user) throw new InvalidPasswordResetTokenError();

      await this.replacePassword(transaction, userId, nextPasswordHash);
      await this.revokeSessions(transaction, userId);
      await this.events?.report({
        type: 'password-reset.completed',
        occurredAt: now,
        userId,
      }, transaction);
    });
  }

  private async replacePassword(
    transaction: DatabaseSession,
    userId: number,
    passwordHash: string
  ): Promise<void> {
    await transaction.run({
      sql: [
        `INSERT INTO ${this.tables.passwordCredentials} (user_id, password_hash, updated_at)`,
        'VALUES (?, ?, CURRENT_TIMESTAMP)',
        'ON CONFLICT(user_id) DO UPDATE SET password_hash = excluded.password_hash, updated_at = CURRENT_TIMESTAMP;',
      ].join(' '),
      params: [userId, passwordHash],
    });
  }

  private async revokeSessions(transaction: DatabaseSession, userId: number): Promise<void> {
    await transaction.run({
      sql: `UPDATE ${this.tables.jwtSessions} SET status = 'revoked' WHERE user_id = ? AND status = 'active';`,
      params: [userId],
    });
  }

  private hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
