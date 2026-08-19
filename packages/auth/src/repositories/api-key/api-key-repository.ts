/**
 * ## ApiKeyCredential
 *
 * Metadata describing an API key after successful lookup.
 *
 * The credential contains only the information required for
 * authentication. User identity, roles, and permissions are resolved
 * separately through {@link AuthUserRepository}.
 */
export interface ApiKeyCredential {
  /** Stable credential identifier, when the backing store exposes one. */
  id?: string;

  /** Identifier of the associated application user. */
  userId: string | number;

  /** Indicates whether the credential has been revoked. */
  revoked?: boolean;

  /** Optional absolute expiration time. */
  expiresAt?: Date;
}

/**
 * ## ApiKeyRepository
 *
 * Resolves API-key credentials from presented secrets.
 *
 * Implementations may retrieve credentials from any backing store,
 * including databases, in-memory collections, key-value stores, or
 * external authentication services.
 *
 * The returned credential contains only authentication metadata.
 * Authorization data is resolved separately through
 * {@link AuthUserRepository}.
 */
export interface ApiKeyRepository {
  /**
   * Resolves the credential associated with an API key.
   *
   * Returns `null` when the key is unknown or cannot be authenticated.
   */
  findByKey(key: string): Promise<ApiKeyCredential | null> | ApiKeyCredential | null;
}