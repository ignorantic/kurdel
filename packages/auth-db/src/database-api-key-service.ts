import crypto from 'node:crypto';

import type { AuthEvent, AuthEventSink } from '@kurdel/auth';
import type { Database, DatabaseSession } from '@kurdel/db';

import type { ApiKeyHasher } from './api-key-hasher.js';
import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

type UserRecord = {
  id: number;
  status: string;
};

type ApiKeyRecord = {
  id: string;
  name: string;
  status: 'active' | 'revoked';
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
};

type TransactionalAuthEventSink = AuthEventSink & {
  report(event: AuthEvent, database?: DatabaseSession): Promise<void> | void;
};

export interface CreateApiKeyInput {
  userId: number;
  name: string;
  expiresAt?: Date;
}

export interface CreatedApiKey {
  id: string;
  key: string;
  name: string;
  expiresAt: string | null;
}

export interface ApiKeyMetadata {
  id: string;
  name: string;
  status: 'active' | 'revoked' | 'expired';
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export class ActiveUserNotFoundError extends Error {
  constructor(readonly userId: number) {
    super(`Active user '${userId}' was not found`);
  }
}

export class ApiKeyUserNotFoundError extends Error {
  constructor(readonly userId: number) {
    super(`User '${userId}' was not found`);
  }
}

export class ApiKeyNotFoundError extends Error {
  constructor(
    readonly userId: number,
    readonly apiKeyId: string
  ) {
    super(`API key '${apiKeyId}' was not found for user '${userId}'`);
  }
}

export class DatabaseApiKeyService {
  private readonly tables: AuthDatabaseTables;

  constructor(
    private readonly db: Database,
    private readonly hasher: ApiKeyHasher,
    tables: Partial<AuthDatabaseTables> = {},
    private readonly events?: TransactionalAuthEventSink,
    private readonly now: () => Date = () => new Date()
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  async list(userId: number): Promise<ApiKeyMetadata[]> {
    const user = (await this.db.get({
      sql: `SELECT id, status FROM ${this.tables.users} WHERE id = ?;`,
      params: [userId],
    })) as UserRecord | undefined;
    if (!user) throw new ApiKeyUserNotFoundError(userId);

    const records = (await this.db.all({
      sql: [
        'SELECT id, name, status, expires_at, last_used_at, created_at',
        `FROM ${this.tables.apiKeys} WHERE user_id = ? ORDER BY created_at DESC, id DESC;`,
      ].join(' '),
      params: [userId],
    })) as ApiKeyRecord[];
    return records.map(record => ({
      id: record.id,
      name: record.name,
      status: this.effectiveStatus(record),
      expiresAt: record.expires_at,
      lastUsedAt: record.last_used_at,
      createdAt: record.created_at,
    }));
  }

  async create(input: CreateApiKeyInput): Promise<CreatedApiKey> {
    const id = crypto.randomUUID();
    const key = `kdl_${crypto.randomBytes(32).toString('base64url')}`;
    const expiresAt = input.expiresAt?.toISOString() ?? null;

    await this.db.transaction(async transaction => {
      const user = (await transaction.get({
        sql: `SELECT id, status FROM ${this.tables.users} WHERE id = ?;`,
        params: [input.userId],
      })) as UserRecord | undefined;
      if (!user || user.status !== 'active') {
        throw new ActiveUserNotFoundError(input.userId);
      }

      await transaction.run({
        sql: [
          `INSERT INTO ${this.tables.apiKeys}`,
          '(id, user_id, key_hash, name, status, expires_at)',
          'VALUES (?, ?, ?, ?, ?, ?);',
        ].join(' '),
        params: [id, input.userId, this.hasher.hash(key), input.name, 'active', expiresAt],
      });

      await this.events?.report(
        {
          type: 'api-key.issued',
          occurredAt: this.now(),
          userId: input.userId,
          credential: { type: 'api-key', id },
        },
        transaction
      );
    });

    return { id, key, name: input.name, expiresAt };
  }

  async revoke(userId: number, apiKeyId: string): Promise<void> {
    await this.db.transaction(async transaction => {
      const apiKey = (await transaction.get({
        sql: `SELECT id FROM ${this.tables.apiKeys} WHERE id = ? AND user_id = ?;`,
        params: [apiKeyId, userId],
      })) as { id: string } | undefined;
      if (!apiKey) throw new ApiKeyNotFoundError(userId, apiKeyId);

      await transaction.run({
        sql: `UPDATE ${this.tables.apiKeys} SET status = 'revoked' WHERE id = ? AND user_id = ?;`,
        params: [apiKeyId, userId],
      });

      await this.events?.report(
        {
          type: 'api-key.revoked',
          occurredAt: this.now(),
          userId,
          credential: { type: 'api-key', id: apiKeyId },
        },
        transaction
      );
    });
  }

  private effectiveStatus(record: ApiKeyRecord): ApiKeyMetadata['status'] {
    if (record.status === 'revoked') return 'revoked';
    if (record.expires_at && new Date(record.expires_at).getTime() <= Date.now()) return 'expired';
    return 'active';
  }
}
