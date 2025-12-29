import type { AuthUser } from '@kurdel/common';

import type { ApiKeyRepository } from 'src/repositories/index.js';

/**
 * ## InMemoryApiKeyRepository
 *
 * A simple key → user lookup backed by a JavaScript object.
 *
 * Useful for:
 * - local demos
 * - unit tests
 * - seed/bootstrap environments
 */
export class InMemoryApiKeyRepository implements ApiKeyRepository {
  constructor(
    private readonly keys: Record<string, AuthUser>
  ) {}

  findByKey(key: string): AuthUser | null {
    return this.keys[key] ?? null;
  }
}
