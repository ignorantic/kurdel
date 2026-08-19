import type { AuthUserRepository } from 'src/repositories/user/index.js';

/**
 * @deprecated Use {@link AuthUserRepository} instead.
 *
 * This alias reflected an earlier design where JWT authentication was
 * coupled to user lookup. User identity is now resolved independently
 * of the presented credential.
 */
export type JwtRepository = AuthUserRepository;
