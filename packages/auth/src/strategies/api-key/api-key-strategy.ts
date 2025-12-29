import type { AuthUser } from '@kurdel/common';

import type { AuthStrategy } from 'src/domain/index.js';
import type { ApiKeyRepository } from 'src/repositories/index.js';

export interface ApiKeyStrategyOptions {
  /**
   * Name of the request header containing the API key.
   * Example: `"x-api-key"`.
   */
  header: string;

  /**
   * Repository responsible for resolving users by API key.
   */
  repo: ApiKeyRepository;
}

/**
 * ## ApiKeyStrategy
 *
 * Simple authentication mechanism based on a static API key.
 *
 * This strategy is *storage-agnostic*: it does not know where keys
 * are stored — persistent DB, cache, or memory. All lookups are
 * delegated to the injected `ApiKeyRepository`.
 */
export class ApiKeyStrategy implements AuthStrategy {
  constructor(private readonly options: ApiKeyStrategyOptions) {}

  async authenticate(req: any): Promise<AuthUser | null> {
    const key = req.headers?.[this.options.header];

    if (!key || typeof key !== 'string') return null;

    // Delegated lookup — repository decides where the key lives.
    return await this.options.repo.findByKey(key);
  }
}
