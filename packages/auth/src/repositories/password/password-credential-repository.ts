/**
 * ## PasswordCredential
 *
 * Password credential associated with an application user.
 *
 * The credential contains only the information required for password
 * verification. User identity, roles, and permissions are resolved
 * separately through {@link AuthUserRepository}.
 */
export interface PasswordCredential {
  /** Identifier of the associated application user. */
  userId: string | number;

  /** Persisted password hash. */
  passwordHash: string;
}

/**
 * ## PasswordCredentialRepository
 *
 * Resolves password credentials from an application-defined login.
 *
 * The login identifier is application-specific (for example, an email
 * address or username). Implementations are responsible for mapping the
 * supplied login to the corresponding credential.
 */
export interface PasswordCredentialRepository {
  /**
   * Resolves the password credential associated with a login.
   *
   * Returns `null` when the login cannot be authenticated.
   */
  findByLogin(login: string): Promise<PasswordCredential | null> | PasswordCredential | null;
}
