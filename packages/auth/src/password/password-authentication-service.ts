import type { AuthUser } from '@kurdel/common';

import type { PasswordCredentialRepository } from '../repositories/password/index.js';
import type { AuthUserRepository } from '../repositories/user/index.js';
import type { PasswordHasher } from './password-hasher.js';

/**
 * ## PasswordAuthenticationService
 *
 * Coordinates password-based authentication.
 *
 * Responsibilities:
 * - resolve password credentials from an application-defined login
 * - verify the presented password
 * - resolve the current authenticated user
 *
 * Guarantees:
 * - unknown credentials never authenticate
 * - invalid passwords never authenticate
 * - user identity is resolved only after successful password verification
 *
 * Non-responsibilities:
 * - password persistence
 * - password hashing implementation
 * - user management
 */
export class PasswordAuthenticationService {
  constructor(
    private readonly credentials: PasswordCredentialRepository,
    private readonly users: AuthUserRepository,
    private readonly hasher: PasswordHasher
  ) {}

  /**
   * Authenticates a user using a login identifier and password.
   *
   * Returns `null` when the login cannot be authenticated or the
   * associated user is unavailable.
   *
   * Unknown logins intentionally perform a password hashing operation
   * before returning to reduce observable timing differences.
   */
  async authenticate(login: string, password: string): Promise<AuthUser | null> {
    const credential = await this.credentials.findByLogin(login);

    if (!credential) {
      // Keep the expensive password operation on the unknown-login path too.
      await this.hasher.hash(password);
      return null;
    }

    if (!(await this.hasher.verify(password, credential.passwordHash))) {
      return null;
    }

    return this.users.findById(credential.userId);
  }
}