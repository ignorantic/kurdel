import type { ApiKeyCredential, ApiKeyRepository } from 'src/repositories/index.js';

/**
 * ## InMemoryApiKeyRepository
 *
 * In-memory implementation of {@link ApiKeyRepository}.
 *
 * Intended for tests, examples, and small applications where
 * credential data is managed directly in memory.
 */
export class InMemoryApiKeyRepository implements ApiKeyRepository {
  constructor(private readonly keys: Record<string, ApiKeyCredential>) {}

  /**
   * Resolves the credential associated with an API key.
   */
  findByKey(key: string): ApiKeyCredential | null {
    return this.keys[key] ?? null;
  }
}