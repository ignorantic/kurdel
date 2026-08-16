import type { AuthEvent, AuthEventSink } from '@kurdel/auth';
import type { IDatabase, IDatabaseSession } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

export type StoredAuthEvent = {
  id: number;
  type: AuthEvent['type'];
  occurredAt: string;
  strategy: string | null;
  userId: string | null;
  credentialType: string | null;
  credentialId: string | null;
  reason: string | null;
  policy: string | null;
};

export type ListAuthEventsInput = {
  userId?: string | number;
  type?: AuthEvent['type'];
  from?: Date | string;
  to?: Date | string;
  limit?: number;
  offset?: number;
};

export type AuthEventList = {
  events: StoredAuthEvent[];
  total: number;
  limit: number;
  offset: number;
};

type AuthEventRecord = {
  id: number;
  type: AuthEvent['type'];
  occurred_at: string;
  strategy: string | null;
  user_id: string | null;
  credential_type: string | null;
  credential_id: string | null;
  reason: string | null;
  policy: string | null;
};

/** Persists and queries sanitized authentication audit events. */
export class DatabaseAuthEventStore implements AuthEventSink {
  private readonly tables: AuthDatabaseTables;

  constructor(
    private readonly db: IDatabase,
    tables: Partial<AuthDatabaseTables> = {}
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  async report(event: AuthEvent, database: IDatabaseSession = this.db): Promise<void> {
    await database.run({
      sql: [
        `INSERT INTO ${this.tables.authEvents}`,
        '(type, occurred_at, strategy, user_id, credential_type, credential_id, reason, policy)',
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      ].join(' '),
      params: [
        event.type,
        event.occurredAt.toISOString(),
        'strategy' in event ? (event.strategy ?? null) : null,
        event.userId === undefined ? null : String(event.userId),
        event.credential?.type ?? null,
        event.credential?.id ?? null,
        'reason' in event ? event.reason : null,
        'policy' in event ? (event.policy ?? null) : null,
      ],
    });
  }

  async list(input: ListAuthEventsInput = {}): Promise<StoredAuthEvent[]> {
    return (await this.listPage(input)).events;
  }

  async listPage(input: ListAuthEventsInput = {}): Promise<AuthEventList> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (input.userId !== undefined) {
      conditions.push('user_id = ?');
      params.push(String(input.userId));
    }
    if (input.type) {
      conditions.push('type = ?');
      params.push(input.type);
    }
    if (input.from) {
      conditions.push('occurred_at >= ?');
      params.push(this.serializeDate(input.from));
    }
    if (input.to) {
      conditions.push('occurred_at <= ?');
      params.push(this.serializeDate(input.to));
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const records = (await this.db.all({
      sql: [
        'SELECT id, type, occurred_at, strategy, user_id,',
        'credential_type, credential_id, reason, policy',
        `FROM ${this.tables.authEvents} ${where}`,
        'ORDER BY occurred_at DESC, id DESC LIMIT ? OFFSET ?;',
      ].join(' '),
      params: [...params, limit, offset],
    })) as AuthEventRecord[];
    const count = (await this.db.get({
      sql: `SELECT COUNT(*) AS count FROM ${this.tables.authEvents} ${where};`,
      params,
    })) as { count: number };

    return {
      events: records.map(record => ({
        id: record.id,
        type: record.type,
        occurredAt: record.occurred_at,
        strategy: record.strategy,
        userId: record.user_id,
        credentialType: record.credential_type,
        credentialId: record.credential_id,
        reason: record.reason,
        policy: record.policy,
      })),
      total: count.count,
      limit,
      offset,
    };
  }

  private serializeDate(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : value;
  }
}
