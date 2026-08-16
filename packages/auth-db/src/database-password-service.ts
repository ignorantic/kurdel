import type { PasswordHasher } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

export class PasswordUserNotFoundError extends Error {
  constructor(readonly userId: number) {
    super(`User '${userId}' was not found`);
  }
}

export class DatabasePasswordService {
  private readonly tables: AuthDatabaseTables;

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
