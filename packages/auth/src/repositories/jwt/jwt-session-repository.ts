/**
 * ## JwtSession
 *
 * Server-side state associated with a JWT through its `jti` claim.
 *
 * The session allows signed tokens to be revoked before their
 * cryptographic expiration without maintaining server-side token data.
 */
export interface JwtSession {
  /** Stable session identifier referenced by the JWT `jti` claim. */
  id: string;

  /** Identifier of the associated application user. */
  userId: string | number;

  /** Indicates whether the session has been revoked. */
  revoked: boolean;

  /** Optional server-side expiration time. */
  expiresAt?: Date;
}

/**
 * ## JwtSessionRepository
 *
 * Resolves the current state of server-side JWT sessions.
 *
 * Implementations expose whether a session exists, has been revoked,
 * or has expired independently of the JWT itself.
 */
export interface JwtSessionRepository {
  /**
   * Resolves a JWT session by its identifier.
   *
   * Returns `null` when the session does not exist.
   */
  findById(id: string): Promise<JwtSession | null>;
}