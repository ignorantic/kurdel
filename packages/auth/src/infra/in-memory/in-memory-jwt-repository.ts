import type { AuthUser } from '@kurdel/common';

import type { JwtRepository } from 'src/repositories/index.js';

/**
 * ## InMemoryJwtRepository
 *
 * ID → user lookup backed by a JavaScript object.
 *
 * Useful for:
 * - local demos
 * - unit tests
 * - seed/bootstrap environments
 */
export class InMemoryJwtRepository implements JwtRepository {
  constructor(
    private readonly users: AuthUser[]
  ) {}

  findUserById(id: string | number): AuthUser | null {
    return this.users.find(user => user.id === id) ?? null;
  }
}
