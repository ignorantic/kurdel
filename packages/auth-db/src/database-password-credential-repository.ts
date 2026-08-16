import type { PasswordCredential, PasswordCredentialRepository } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

type CredentialRecord = { user_id: string | number; password_hash: string };

export class DatabasePasswordCredentialRepository implements PasswordCredentialRepository {
  private readonly tables: AuthDatabaseTables;

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
