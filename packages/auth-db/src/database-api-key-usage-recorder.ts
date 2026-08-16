import type { ApiKeyUsageRecorder } from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

/** Records the most recent successful use of a database-backed API key. */
export class DatabaseApiKeyUsageRecorder implements ApiKeyUsageRecorder {
  private readonly tables: AuthDatabaseTables;

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
