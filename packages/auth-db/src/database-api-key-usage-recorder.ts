import type { ApiKeyUsageRecorder } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

/**
 * ## DatabaseApiKeyUsageRecorder
 *
 * Database-backed recorder for API key usage.
 *
 * Responsibilities:
 * - record the most recent successful use of an API key
 * - isolate API key usage persistence from the underlying database schema
 *
 * Guarantees:
 * - updates only the API key usage timestamp
 * - remains database-agnostic (SQLite/PostgreSQL)
 *
 * Non-responsibilities:
 * - API key validation
 * - authentication
 * - audit event persistence
 * - HTTP request handling
 */
export class DatabaseApiKeyUsageRecorder implements ApiKeyUsageRecorder {
  private readonly tables: AuthDatabaseTables;

  /**
   * Creates a new database-backed API key usage recorder.
   *
   * @param db Database abstraction used for persistence.
   * @param tables Optional table name overrides.
   */
  constructor(
    private readonly db: Database,
    tables: Partial<AuthDatabaseTables> = {}
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  async recordUsage(credentialId: string, usedAt: Date): Promise<void> {
    await this.db.run({
      sql: `UPDATE ${this.tables.apiKeys} SET last_used_at = ? WHERE id = ?;`,
      params: [usedAt.toISOString(), credentialId],
    });
  }
}
