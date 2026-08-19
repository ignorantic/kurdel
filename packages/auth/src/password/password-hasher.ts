/**
 * ## PasswordHasher
 *
 * Hashes and verifies passwords.
 *
 * Implementations are responsible only for password hashing and
 * verification. They neither manage password persistence nor enforce
 * application-specific password policies.
 */
export interface PasswordHasher {
  /**
   * Derives a password hash suitable for persistent storage.
   */
  hash(password: string): Promise<string> | string;

  /**
   * Verifies a password against a previously generated hash.
   *
   * Returns `false` when the password does not match or the encoded
   * hash cannot be verified.
   */
  verify(password: string, encodedHash: string): Promise<boolean> | boolean;
}