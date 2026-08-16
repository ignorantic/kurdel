import crypto from 'node:crypto';

import type { IDatabase } from '@kurdel/db';

export class MigrationLockedError extends Error {
  constructor() {
    super('Another migration operation currently holds the database lock');
  }
}

/** Portable lease preventing concurrent migration operations. */
export class MigrationLock {
  private readonly owner = crypto.randomUUID();

  constructor(
    private readonly connection: IDatabase,
    private readonly leaseMs = 60 * 60 * 1000,
  ) {}

  async initialize(): Promise<void> {
    const datetime = this.connection.dialect === 'postgres' ? 'TIMESTAMPTZ' : 'DATETIME';
    await this.connection.run({
      sql: [
        'CREATE TABLE IF NOT EXISTS migration_locks',
        `(id INTEGER PRIMARY KEY, owner VARCHAR(64) NOT NULL, expires_at ${datetime} NOT NULL);`,
      ].join(' '),
      params: [],
    });
  }

  async acquire(now = new Date()): Promise<void> {
    const expiresAt = new Date(now.getTime() + this.leaseMs);
    const acquired = await this.connection.get({
      sql: [
        'INSERT INTO migration_locks (id, owner, expires_at) VALUES (?, ?, ?)',
        'ON CONFLICT(id) DO UPDATE SET owner = excluded.owner, expires_at = excluded.expires_at',
        'WHERE migration_locks.expires_at <= ?',
        'RETURNING owner;',
      ].join(' '),
      params: [1, this.owner, expiresAt.toISOString(), now.toISOString()],
    }) as { owner: string } | undefined;
    if (acquired?.owner !== this.owner) throw new MigrationLockedError();
  }

  async release(): Promise<void> {
    await this.connection.run({
      sql: 'DELETE FROM migration_locks WHERE id = ? AND owner = ?;',
      params: [1, this.owner],
    });
  }
}
