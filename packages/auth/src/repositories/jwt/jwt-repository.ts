import type { AuthUser } from '@kurdel/common';

/**
 * ## JwtRepository
 *
 * Abstraction for retrieving user identity by JWT.
 */
export interface JwtRepository {
  /**
   * Returns a user associated with the given ID.
   */
  findUserById(id: string | number): Promise<AuthUser | null> | AuthUser | null;
}
