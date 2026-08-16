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

/** Creates and revokes the server-side state referenced by JWT `jti` claims. */
export class DatabaseJwtSessionService {
  private readonly tables: AuthDatabaseTables;

  constructor(
    private readonly db: Database,
    tables: Partial<AuthDatabaseTables> = {},
    private readonly events?: TransactionalAuthEventSink,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

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
}
