import crypto from 'node:crypto';

import type { ApiKeyHasher } from '@kurdel/auth-db';
import type { IDatabase } from '@kurdel/db';

type UserRecord = {
  id: number;
  status: string;
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

export class ActiveUserNotFoundError extends Error {
  constructor(readonly userId: number) {
    super(`Active user '${userId}' was not found`);
  }
}

export class DatabaseApiKeyService {
  constructor(
    private readonly db: IDatabase,
    private readonly hasher: ApiKeyHasher,
  ) {}

  async create(input: CreateApiKeyInput): Promise<CreatedApiKey> {
    const user = await this.db.get({
      sql: 'SELECT id, status FROM users WHERE id = ?;',
      params: [input.userId],
    }) as UserRecord | undefined;
    if (!user || user.status !== 'active') {
      throw new ActiveUserNotFoundError(input.userId);
    }

    const id = crypto.randomUUID();
    const key = `kdl_${crypto.randomBytes(32).toString('base64url')}`;
    const expiresAt = input.expiresAt?.toISOString() ?? null;

    await this.db.run({
      sql: [
        'INSERT INTO api_keys',
        '(id, user_id, key_hash, name, status, expires_at)',
        'VALUES (?, ?, ?, ?, ?, ?);',
      ].join(' '),
      params: [
        id,
        input.userId,
        this.hasher.hash(key),
        input.name,
        'active',
        expiresAt,
      ],
    });

    return { id, key, name: input.name, expiresAt };
  }
}
