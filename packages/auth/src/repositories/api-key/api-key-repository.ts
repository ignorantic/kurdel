export interface ApiKeyCredential {
  /** Stable identity resolved after credential validation. */
  userId: string | number;
  /** Revoked credentials must never authenticate. */
  revoked?: boolean;
  /** Optional absolute expiry time. */
  expiresAt?: Date;
}

/**
 * ## ApiKeyRepository
 *
 * Abstraction for retrieving credential metadata by API key.
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
   * Returns credential metadata associated with the given API key.
   * If the key is unknown, must return `null`.
   */
  findByKey(key: string): Promise<ApiKeyCredential | null> | ApiKeyCredential | null;
}
