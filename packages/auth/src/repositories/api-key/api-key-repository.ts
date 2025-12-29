import type { AuthUser } from '@kurdel/common';

/**
 * ## ApiKeyRepository
 *
 * Abstraction for retrieving user identity by API key.
 *
 * A repository implementation may:
 * - load records from an in-memory map
 * - query a database
 * - read from Redis or any other KV store
 * - call an external authentication service
 *
 * Strategies depend only on this interface, not on the storage details.
 */
export interface ApiKeyRepository {
  /**
   * Returns a user associated with the given API key.
   * If the key is unknown, must return `null`.
   */
  findByKey(key: string): Promise<AuthUser | null> | AuthUser | null;
}
