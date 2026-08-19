import type { AuthUser } from '@kurdel/common';

import type { AuthUserRepository } from 'src/repositories/index.js';

/**
 * ## InMemoryAuthUserRepository
 *
 * In-memory implementation of {@link AuthUserRepository}.
 *
 * Intended for tests, examples, and small applications where user
 * identities are managed directly in memory.
 */
export class InMemoryAuthUserRepository implements AuthUserRepository {
  constructor(private readonly users: AuthUser[]) {}

  /**
   * Resolves the current user by identifier.
   */
  findById(id: string | number): AuthUser | null {
    return this.users.find(user => user.id === id) ?? null;
  }
}