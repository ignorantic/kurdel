import crypto from 'node:crypto';

import type { IDatabase } from '@kurdel/db';
import type { ApiKeyCredential, ApiKeyRepository } from '@kurdel/auth';

type ApiKeyRecord = {
  user_id: string | number;
  status: string;
  expires_at: string | null;
};

export class DatabaseApiKeyRepository implements ApiKeyRepository {
  constructor(private readonly db: IDatabase) {}

  async findByKey(key: string): Promise<ApiKeyCredential | null> {
    const record = await this.db.get({
      sql: 'SELECT user_id, status, expires_at FROM api_keys WHERE key_hash = ?;',
      params: [DatabaseApiKeyRepository.hash(key)],
    }) as ApiKeyRecord | undefined;

    if (!record) return null;

    return {
      userId: record.user_id,
      revoked: record.status !== 'active',
      expiresAt: record.expires_at ? new Date(record.expires_at) : undefined,
    };
  }

  static hash(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
