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

/**
 * ## DatabaseApiKeyRepository
 *
 * Repository that resolves persisted API key credentials for
 * authentication.
 *
 * Responsibilities:
 * - locate API key credentials by plaintext API key
 * - resolve credential metadata required for authentication
 *
 * Guarantees:
 * - hashes incoming API keys before querying the database
 * - never exposes or returns stored key hashes
 * - remains database-agnostic (SQLite/PostgreSQL)
 *
 * Non-responsibilities:
 * - API key issuance
 * - API key revocation
 * - usage recording
 * - authorization policy evaluation
 * - HTTP request handling
 */
export class DatabaseApiKeyRepository implements ApiKeyRepository {
  private readonly db: Database;
  private readonly hasher: ApiKeyHasher;
  private readonly tables: AuthDatabaseTables;

  /**
   * Creates a new database-backed API key repository.
   *
   * @param db Database abstraction used for credential lookups.
   * @param hasher Hashing strategy used to derive lookup hashes.
   * @param tables Optional table name overrides.
   */
  constructor({ db, hasher, tables = {} }: {
    db: Database;
    hasher: ApiKeyHasher;
    tables?: Partial<AuthDatabaseTables>;
  }) {
    this.db = db;
    this.hasher = hasher;
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
