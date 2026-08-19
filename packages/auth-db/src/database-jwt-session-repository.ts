import type { JwtSession, JwtSessionRepository } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

type JwtSessionRecord = {
  id: string;
  user_id: string | number;
  status: string;
  expires_at: string | null;
};

/**
 * ## DatabaseJwtSessionRepository
 *
 * Database-backed repository for persisted JWT sessions.
 *
 * Responsibilities:
 * - resolve JWT sessions by identifier
 * - map database records to `JwtSession`
 * - isolate JWT validation from the underlying database schema
 *
 * Guarantees:
 * - returns `null` when the session does not exist
 * - exposes session revocation and expiration state
 * - remains database-agnostic (SQLite/PostgreSQL)
 *
 * Non-responsibilities:
 * - session creation or revocation
 * - refresh token management
 * - JWT signing or verification
 * - HTTP request handling
 */
export class DatabaseJwtSessionRepository implements JwtSessionRepository {
  private readonly tables: AuthDatabaseTables;

  /**
   * Creates a new database-backed JWT session repository.
   *
   * @param db Database abstraction used for persistence.
   * @param tables Optional table name overrides.
   */
  constructor(
    private readonly db: Database,
    tables: Partial<AuthDatabaseTables> = {},
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  async findById(id: string): Promise<JwtSession | null> {
    const record = await this.db.get({
      sql: [
        'SELECT id, user_id, status, expires_at',
        `FROM ${this.tables.jwtSessions} WHERE id = ?;`,
      ].join(' '),
      params: [id],
    }) as JwtSessionRecord | undefined;
    if (!record) return null;

    return {
      id: record.id,
      userId: record.user_id,
      revoked: record.status !== 'active',
      ...(record.expires_at ? { expiresAt: new Date(record.expires_at) } : {}),
    };
  }
}
