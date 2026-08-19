import crypto from 'node:crypto';

import type { AuthEvent, AuthEventSink } from '@kurdel/auth';
import type { Database, DatabaseSession } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

type TransactionalAuthEventSink = AuthEventSink & {
  report(event: AuthEvent, database?: DatabaseSession): Promise<void> | void;
};

export type CreatedJwtSession = {
  id: string;
  userId: number;
  expiresAt: string;
};

export type CreatedRefreshableJwtSession = CreatedJwtSession & {
  refreshToken: string;
  refreshExpiresAt: string;
};

export type RefreshedJwtSession = CreatedRefreshableJwtSession;

export type JwtSessionSummary = {
  id: string;
  userId: number;
  status: 'active' | 'revoked' | 'expired';
  expiresAt: string;
  createdAt: string;
};

export class JwtSessionNotFoundError extends Error {
  constructor(readonly userId: number, readonly sessionId: string) {
    super(`JWT session '${sessionId}' was not found for user '${userId}'`);
  }
}

export class ActiveJwtSessionUserNotFoundError extends Error {
  constructor(readonly userId: number) {
    super(`Active user '${userId}' was not found`);
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Refresh token is invalid or expired');
  }
}

/**
 * ## DatabaseJwtSessionService
 *
 * Application service responsible for managing persistent JWT sessions
 * backed by a relational database through the `Database` abstraction.
 *
 * Responsibilities:
 * - create server-side JWT sessions
 * - issue and rotate refresh tokens
 * - list active and historical sessions
 * - revoke individual or all user sessions
 * - emit JWT session audit events
 *
 * Guarantees:
 * - validates that sessions belong to active users
 * - stores refresh tokens as SHA-256 hashes only
 * - rotates refresh tokens atomically
 * - performs all state changes inside database transactions
 * - remains database-agnostic (SQLite/PostgreSQL)
 *
 * Non-responsibilities:
 * - JWT signing or verification
 * - access token generation
 * - authorization policy evaluation
 * - HTTP request handling
 */
export class DatabaseJwtSessionService {
  private readonly tables: AuthDatabaseTables;

  /**
   * Creates a new database-backed JWT session service.
   *
   * @param db Database abstraction used for persistence.
   * @param tables Optional table name overrides.
   * @param events Optional transactional audit event sink.
   * @param now Time provider used for expiration checks and timestamps.
   */
  constructor(
    private readonly db: Database,
    tables: Partial<AuthDatabaseTables> = {},
    private readonly events?: TransactionalAuthEventSink,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  // ---------------------------------------------------------------------
  // JWT session lyfecycle
  // ---------------------------------------------------------------------

  async create(userId: number, expiresAt: Date): Promise<CreatedJwtSession> {
    const expirationTime = expiresAt.getTime();
    if (!Number.isFinite(expirationTime) || expirationTime <= this.now().getTime()) {
      throw new RangeError('JWT session expiration must be in the future');
    }
    const id = crypto.randomUUID();

    await this.db.transaction(async transaction => {
      const user = await transaction.get({
        sql: `SELECT id FROM ${this.tables.users} WHERE id = ? AND status = 'active';`,
        params: [userId],
      });
      if (!user) throw new ActiveJwtSessionUserNotFoundError(userId);

      await transaction.run({
        sql: [
          `INSERT INTO ${this.tables.jwtSessions}`,
          '(id, user_id, status, expires_at) VALUES (?, ?, ?, ?);',
        ].join(' '),
        params: [id, userId, 'active', expiresAt.toISOString()],
      });
      await this.events?.report({
        type: 'jwt-session.created',
        occurredAt: this.now(),
        userId,
        credential: { type: 'jwt', id },
      }, transaction);
    });

    return { id, userId, expiresAt: expiresAt.toISOString() };
  }

  async createRefreshable(
    userId: number,
    refreshExpiresAt: Date,
  ): Promise<CreatedRefreshableJwtSession> {
    const expirationTime = refreshExpiresAt.getTime();
    if (!Number.isFinite(expirationTime) || expirationTime <= this.now().getTime()) {
      throw new RangeError('JWT refresh session expiration must be in the future');
    }
    const id = crypto.randomUUID();
    const refreshToken = this.generateRefreshToken();

    await this.db.transaction(async transaction => {
      const user = await transaction.get({
        sql: `SELECT id FROM ${this.tables.users} WHERE id = ? AND status = 'active';`,
        params: [userId],
      });
      if (!user) throw new ActiveJwtSessionUserNotFoundError(userId);

      await transaction.run({
        sql: [
          `INSERT INTO ${this.tables.jwtSessions}`,
          '(id, user_id, status, expires_at) VALUES (?, ?, ?, ?);',
        ].join(' '),
        params: [id, userId, 'active', refreshExpiresAt.toISOString()],
      });
      await transaction.run({
        sql: [
          `INSERT INTO ${this.tables.jwtRefreshTokens}`,
          '(session_id, token_hash, expires_at) VALUES (?, ?, ?);',
        ].join(' '),
        params: [id, this.hashRefreshToken(refreshToken), refreshExpiresAt.toISOString()],
      });
      await this.events?.report({
        type: 'jwt-session.created',
        occurredAt: this.now(),
        userId,
        credential: { type: 'jwt', id },
      }, transaction);
    });

    return {
      id,
      userId,
      expiresAt: refreshExpiresAt.toISOString(),
      refreshToken,
      refreshExpiresAt: refreshExpiresAt.toISOString(),
    };
  }

  async refresh(refreshToken: string): Promise<RefreshedJwtSession> {
    const nextRefreshToken = this.generateRefreshToken();
    const now = this.now();

    return this.db.transaction(async transaction => {
      const record = await transaction.get({
        sql: [
          'SELECT sessions.id, sessions.user_id, sessions.status,',
          'refresh_tokens.expires_at AS refresh_expires_at',
          `FROM ${this.tables.jwtRefreshTokens} AS refresh_tokens`,
          `INNER JOIN ${this.tables.jwtSessions} AS sessions ON sessions.id = refresh_tokens.session_id`,
          `INNER JOIN ${this.tables.users} AS users ON users.id = sessions.user_id`,
          "WHERE refresh_tokens.token_hash = ? AND users.status = 'active';",
        ].join(' '),
        params: [this.hashRefreshToken(refreshToken)],
      }) as {
        id: string;
        user_id: string | number;
        status: string;
        refresh_expires_at: string;
      } | undefined;
      const expiresAt = record ? new Date(record.refresh_expires_at) : undefined;
      if (
        !record ||
        record.status !== 'active' ||
        !expiresAt ||
        !Number.isFinite(expiresAt.getTime()) ||
        expiresAt.getTime() <= now.getTime()
      ) {
        throw new InvalidRefreshTokenError();
      }

      await transaction.run({
        sql: [
          `UPDATE ${this.tables.jwtRefreshTokens}`,
          'SET token_hash = ?, last_used_at = ? WHERE session_id = ?;',
        ].join(' '),
        params: [this.hashRefreshToken(nextRefreshToken), now.toISOString(), record.id],
      });
      await this.events?.report({
        type: 'jwt-session.refreshed',
        occurredAt: now,
        userId: Number(record.user_id),
        credential: { type: 'jwt', id: record.id },
      }, transaction);

      return {
        id: record.id,
        userId: Number(record.user_id),
        expiresAt: expiresAt.toISOString(),
        refreshToken: nextRefreshToken,
        refreshExpiresAt: expiresAt.toISOString(),
      };
    });
  }

  // ---------------------------------------------------------------------
  // Session management
  // ---------------------------------------------------------------------
  
  async list(userId: number): Promise<JwtSessionSummary[]> {
    const now = this.now().getTime();
    const records = await this.db.all({
      sql: [
        'SELECT id, user_id, status, expires_at, created_at',
        `FROM ${this.tables.jwtSessions} WHERE user_id = ?`,
        'ORDER BY created_at DESC, id DESC;',
      ].join(' '),
      params: [userId],
    }) as Array<{
      id: string;
      user_id: string | number;
      status: string;
      expires_at: string;
      created_at: string;
    }>;

    return records.map(record => ({
      id: record.id,
      userId: Number(record.user_id),
      status: record.status !== 'active'
        ? 'revoked'
        : new Date(record.expires_at).getTime() <= now ? 'expired' : 'active',
      expiresAt: new Date(record.expires_at).toISOString(),
      createdAt: new Date(record.created_at).toISOString(),
    }));
  }

  async revokeAll(userId: number): Promise<void> {
    await this.db.transaction(async transaction => {
      const sessions = await transaction.all({
        sql: `SELECT id FROM ${this.tables.jwtSessions} WHERE user_id = ? AND status = 'active';`,
        params: [userId],
      }) as Array<{ id: string }>;
      await transaction.run({
        sql: `UPDATE ${this.tables.jwtSessions} SET status = 'revoked' WHERE user_id = ? AND status = 'active';`,
        params: [userId],
      });
      for (const session of sessions) {
        await this.events?.report({
          type: 'jwt-session.revoked',
          occurredAt: this.now(),
          userId,
          credential: { type: 'jwt', id: session.id },
        }, transaction);
      }
    });
  }

  async revoke(userId: number, sessionId: string): Promise<void> {
    await this.db.transaction(async transaction => {
      const session = await transaction.get({
        sql: `SELECT id FROM ${this.tables.jwtSessions} WHERE id = ? AND user_id = ?;`,
        params: [sessionId, userId],
      });
      if (!session) throw new JwtSessionNotFoundError(userId, sessionId);

      await transaction.run({
        sql: `UPDATE ${this.tables.jwtSessions} SET status = 'revoked' WHERE id = ?;`,
        params: [sessionId],
      });
      await this.events?.report({
        type: 'jwt-session.revoked',
        occurredAt: this.now(),
        userId,
        credential: { type: 'jwt', id: sessionId },
      }, transaction);
    });
  }

  // ---------------------------------------------------------------------
  // Security helpers
  // ---------------------------------------------------------------------

  private generateRefreshToken(): string {
    return `kdl_rt_${crypto.randomBytes(32).toString('base64url')}`;
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
