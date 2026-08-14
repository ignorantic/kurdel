import type { AuthUser } from '@kurdel/common';

import type { AuthUserRepository } from 'src/repositories/index.js';

/** In-memory identity source intended for tests, demos and bootstrap code. */
export class InMemoryAuthUserRepository implements AuthUserRepository {
  constructor(private readonly users: AuthUser[]) {}

  findById(id: string | number): AuthUser | null {
    return this.users.find(user => user.id === id) ?? null;
  }
}
