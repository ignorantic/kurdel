import type { AuthUserRepository } from 'src/repositories/user/index.js';

/** @deprecated Use AuthUserRepository. JWT is a credential, not a user store. */
export type JwtRepository = AuthUserRepository;
