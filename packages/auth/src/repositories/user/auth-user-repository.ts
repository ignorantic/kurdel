import type { AuthUser } from '@kurdel/common';

/**
 * Resolves the current application identity used for authorization.
 *
 * Implementations exclude identities that must not authenticate, such as
 * disabled or deleted users. Roles come from this source of truth rather than
 * from the presented credential.
 */
export interface AuthUserRepository {
  findById(id: string | number): Promise<AuthUser | null> | AuthUser | null;
}
