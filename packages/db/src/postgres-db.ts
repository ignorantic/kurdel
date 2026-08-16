import { Pool, type PoolClient, type PoolConfig, type QueryResultRow } from 'pg';

import type { DatabaseQuery, Database, DatabaseSession } from './interfaces.js';

/** Converts portable question-mark parameters into PostgreSQL positional parameters. */
export function postgresPlaceholders(sql: string): string {
  let index = 0;
  let quoted = false;
  return [...sql].map((character, position) => {
    if (character === "'" && sql[position - 1] !== '\\') quoted = !quoted;
    if (character === '?' && !quoted) return `$${++index}`;
    return character;
  }).join('');
}

/** PostgreSQL implementation of the common database contract. */
export class PostgresDB implements Database {
  readonly dialect = 'postgres' as const;
  private readonly pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async connect(): Promise<void> {
    const client = await this.pool.connect();
    client.release();
  }

  async get({ sql, params }: DatabaseQuery): Promise<any> {
    return (await this.query(this.pool, sql, params)).rows[0];
  }

  async all({ sql, params }: DatabaseQuery): Promise<any[]> {
    return (await this.query(this.pool, sql, params)).rows;
  }

  async run({ sql, params }: DatabaseQuery): Promise<void> {
    await this.query(this.pool, sql, params);
  }

  async transaction<T>(work: (transaction: DatabaseSession) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const transaction: DatabaseSession = {
        get: async query => (await this.query(client, query.sql, query.params)).rows[0],
        all: async query => (await this.query(client, query.sql, query.params)).rows,
        run: async query => { await this.query(client, query.sql, query.params); },
      };
      const result = await work(transaction);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private query(
    connection: Pool | PoolClient,
    sql: string,
    params: unknown[],
  ): Promise<{ rows: QueryResultRow[] }> {
    return connection.query(postgresPlaceholders(sql), params);
  }
}
