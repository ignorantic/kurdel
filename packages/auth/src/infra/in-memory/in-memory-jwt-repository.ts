import type { AuthUser } from '@kurdel/common';

import type { JwtRepository } from 'src/repositories/index.js';
import { InMemoryAuthUserRepository } from './in-memory-auth-user-repository.js';

/**
 * @deprecated Use {@link InMemoryAuthUserRepository} instead.
 *
 * Compatibility alias for the previous repository name.
 */
export class InMemoryJwtRepository
  extends InMemoryAuthUserRepository
  implements JwtRepository {
  constructor(users: AuthUser[]) {
    super(users);
  }
}