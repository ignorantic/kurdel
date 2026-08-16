export interface PasswordCredential {
  userId: string | number;
  passwordHash: string;
}

/** Resolves a password credential by an application-defined login. */
export interface PasswordCredentialRepository {
  findByLogin(login: string): Promise<PasswordCredential | null> | PasswordCredential | null;
}
