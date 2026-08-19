import type { AuthUser } from '@kurdel/common';

/**
 * ## AuthUserRepository
 *
 * Resolves the current application identity for authentication and
 * authorization.
 *
 * Implementations expose the application's current source of truth.
 * Users that are no longer allowed to authenticate (for example,
 * disabled or deleted accounts) should not be returned.
 *
 * Authorization data such as roles and permissions is resolved from
 * this repository rather than from the presented credential.
 */
export interface AuthUserRepository {
   /**
   * Resolves the current authenticated user by identifier.
   *
   * Returns `null` when the user does not exist or is no longer
   * eligible for authentication.
   */
  findById(id: string | number): Promise<AuthUser | null> | AuthUser | null;
}
