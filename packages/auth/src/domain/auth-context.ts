import type { AuthCredential, AuthUser } from '@kurdel/common';

export type { AuthContext, AuthCredential } from '@kurdel/common';

/**
 * ## AuthenticationResult
 *
 * Result returned by an authentication strategy after successful
 * credential validation.
 *
 * The authentication middleware enriches this result with the strategy
 * name before exposing it through `ctx.auth`.
 */
export interface AuthenticationResult<TUser extends AuthUser = AuthUser> {
  /** Authenticated application user. */
  user: TUser;

  /** Metadata describing the authenticated credential. */
  credential?: AuthCredential;

  /**
   * Optional authentication claims produced by the strategy.
   *
   * For example, JWT strategies may expose verified token claims.
   */
  claims?: Record<string, unknown>;
}