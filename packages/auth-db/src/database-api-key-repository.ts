import type { ApiKeyCredential, ApiKeyRepository } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import type { ApiKeyHasher } from './api-key-hasher.js';
import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

type ApiKeyRecord = {
  id: string;
  user_id: string | number;
  status: string;
  expires_at: string | null;
};

export class DatabaseApiKeyRepository implements ApiKeyRepository {
  private readonly tables: AuthDatabaseTables;

  constructor(
    private readonly db: Database,
    private readonly hasher: ApiKeyHasher,
    tables: Partial<AuthDatabaseTables> = {}
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  async findByKey(key: string): Promise<ApiKeyCredential | null> {
    const record = (await this.db.get({
      sql: [
        'SELECT id, user_id, status, expires_at',
        `FROM ${this.tables.apiKeys}`,
        'WHERE key_hash = ?;',
      ].join(' '),
      params: [this.hasher.hash(key)],
    })) as ApiKeyRecord | undefined;
    if (!record) return null;

    return {
      id: record.id,
      userId: record.user_id,
      revoked: record.status !== 'active',
      expiresAt: record.expires_at ? new Date(record.expires_at) : undefined,
    };
  }
}
