import type { JwtSession, JwtSessionRepository } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

type JwtSessionRecord = {
  id: string;
  user_id: string | number;
  status: string;
  expires_at: string | null;
};

/** Resolves persisted JWT sessions for token revocation checks. */
export class DatabaseJwtSessionRepository implements JwtSessionRepository {
  private readonly tables: AuthDatabaseTables;

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
