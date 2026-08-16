import type { AuthUser } from '@kurdel/common';

import type { PasswordCredentialRepository } from '../repositories/password/index.js';
import type { AuthUserRepository } from '../repositories/user/index.js';
import type { PasswordHasher } from './password-hasher.js';

export class PasswordAuthenticationService {
  constructor(
    private readonly credentials: PasswordCredentialRepository,
    private readonly users: AuthUserRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async authenticate(login: string, password: string): Promise<AuthUser | null> {
    const credential = await this.credentials.findByLogin(login);
    if (!credential) {
      // Keep the expensive password operation on the unknown-login path too.
      await this.hasher.hash(password);
      return null;
    }
    if (!(await this.hasher.verify(password, credential.passwordHash))) return null;
    return this.users.findById(credential.userId);
  }
}
